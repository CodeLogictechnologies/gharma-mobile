import FormInput from "@/components/common/FormInput";
import { syncAndClearGuestAddress } from "@/features/address/libs";
import { syncAndClearGuestCart } from "@/features/cart/libs/syncGuestCart";
import { useAuthStore } from "@/store/useAuth";
import { useNotificationStore } from "@/store/useNotificationStore";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Linking from "expo-linking";
import { useRouter, type Href } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useToast } from "heroui-native";
import { ChevronLeft } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import * as yup from "yup";
import AppImage from "~/assets/images/app-main.png";
import FacebookIcon from "~/assets/images/icon/FacebookIcon";
import GoogleIcon from "~/assets/images/icon/GoogleIcon";
import { RoleSelectionSheet } from "./components/RoleSelectionSheet";
import { useGoogleLogin, useLogin } from "./hooks";
import { RoleData } from "./types";

WebBrowser.maybeCompleteAuthSession();

const loginSchema = yup.object({
  phone: yup
    .string()
    .required("Mobile number is required")
    .matches(/^[0-9]{10}$/, "Must be a valid 10-digit number"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = yup.InferType<typeof loginSchema>;

const roleRoutes: Record<string, Href> = {
  Wholesaler: "/(app)/(tabs)/(home)",
  Retailer: "/(app)/(tabs)/(home)",
};

const Login = () => {
  const { toast } = useToast();
  const logIn = useAuthStore((state) => state.logIn);
  const setRoleId = useAuthStore((state) => state.setRoleId);
  const setSelectedRole = useAuthStore((state) => state.setSelectedRole);

  const { fcmToken } = useNotificationStore();
  const [availableRoles, setAvailableRoles] = useState<RoleData[]>([]);
  const [showRoleSheet, setShowRoleSheet] = useState(false);
  const [pendingLogin, setPendingLogin] = useState<{
    token: string;
    refreshToken: string;
  } | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      phone: "",
      password: "",
    },
  });

  const { mutate, isPending } = useLogin();

  const completeLogin = useCallback(
    async (token: string, refreshToken: string, role: RoleData) => {
      setIsNavigating(true);
      logIn(token, refreshToken);
      setRoleId(role.roleid);
      setSelectedRole(role.rolename);

      await Promise.all([syncAndClearGuestAddress(), syncAndClearGuestCart()]);

      const route = roleRoutes[role.rolename];
      if (route) {
        router.navigate(route);
      }
    },
    [logIn, router, setRoleId, setSelectedRole],
  );

  const handleGoogleToken = useCallback(
    async (token: string, refreshToken: string, roles?: RoleData[]) => {
      if (roles && roles.length > 1) {
        setPendingLogin({ token, refreshToken });
        setAvailableRoles(roles);
        setShowRoleSheet(true);
        return;
      }

      if (roles && roles.length === 1) {
        await completeLogin(token, refreshToken, roles[0]);
        return;
      }

      logIn(token, refreshToken);
      await Promise.all([syncAndClearGuestAddress(), syncAndClearGuestCart()]);
      router.navigate("/(app)/(tabs)/(home)");
    },
    [completeLogin, logIn, router],
  );

  useEffect(() => {
    const subscription = Linking.addEventListener("url", async ({ url }) => {
      if (!url.includes("call-back") && !url.includes("callback")) return;

      try {
        const parsed = Linking.parse(url);
        const token = parsed.queryParams?.token as string | undefined;
        const refreshToken =
          (parsed.queryParams?.refresh_token as string) ?? "";
        const rolesRaw = parsed.queryParams?.roles as string | undefined;
        const roles = rolesRaw ? JSON.parse(rolesRaw) : undefined;

        if (token) {
          setIsGoogleLoading(false);
          await handleGoogleToken(token, refreshToken, roles);
        }
      } catch (e) {
        console.error("Deep link parse error:", e);
        setIsGoogleLoading(false);
      }
    });

    return () => subscription.remove();
  }, [handleGoogleToken]);

  const handleRoleSelect = useCallback(
    async (role: RoleData) => {
      setShowRoleSheet(false);
      const loginData = pendingLogin;
      setPendingLogin(null);

      if (loginData) {
        await completeLogin(loginData.token, loginData.refreshToken, role);
      }
    },
    [pendingLogin, completeLogin],
  );

  const closeRoleSheet = useCallback(() => {
    setShowRoleSheet(false);
    setPendingLogin(null);
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    const payload = { ...data, devicetoken: fcmToken || null };

    mutate(payload, {
      onSuccess: async (res) => {
        if (!res.token || !res.refresh_token) return;

        if (res?.roles && res?.roles.length > 1) {
          setPendingLogin({
            token: res.token,
            refreshToken: res.refresh_token,
          });
          setAvailableRoles(res.roles);
          setShowRoleSheet(true);
          return;
        }

        const singleRole = res?.roles?.[0];
        if (singleRole) {
          await completeLogin(res.token, res.refresh_token, singleRole);
        }
      },
    });
  };

  const { refetch: fetchGoogleAuth } = useGoogleLogin();

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      const result = await fetchGoogleAuth();

      if (!result.data?.url) {
        setIsGoogleLoading(false);
        toast.show({
          variant: "danger",
          label: "Error",
          description: "Could not get Google login URL.",
        });
        return;
      }

      const browserResult = await WebBrowser.openAuthSessionAsync(
        result.data.url,
        "gharma://call-back",
      );

      if (browserResult.type === "cancel" || browserResult.type === "dismiss") {
        setIsGoogleLoading(false);
        return;
      }

      if (browserResult.type === "success" && browserResult.url) {
        const parsed = Linking.parse(browserResult.url);
        const token = parsed.queryParams?.token as string | undefined;
        const refreshToken =
          (parsed.queryParams?.refresh_token as string) ?? "";
        const rolesRaw = parsed.queryParams?.roles as string | undefined;
        const roles = rolesRaw ? JSON.parse(rolesRaw) : undefined;

        if (token) {
          setIsGoogleLoading(false);
          await handleGoogleToken(token, refreshToken, roles);
          return;
        }
      }

      const googleRedirectUrl = result.data.url;
      const callbackUrl = googleRedirectUrl.replace(
        /\/auth\/google\/redirect.*$/,
        "/auth/google/call-back",
      );

      try {
        console.warn(
          "Backend did not redirect to gharma:// — falling back to direct fetch. " +
            "Ask backend to redirect to gharma://call-back?token=...",
        );
        const callbackResponse = await fetch(callbackUrl, {
          headers: { Accept: "application/json" },
        });
        const data = await callbackResponse.json();

        if (data?.token) {
          setIsGoogleLoading(false);
          await handleGoogleToken(
            data.token,
            data.refresh_token ?? "",
            data.roles,
          );
          return;
        }
      } catch (fetchErr) {
        console.error("Callback fetch fallback error:", fetchErr);
      }

      setIsGoogleLoading(false);
      toast.show({
        variant: "danger",
        label: "Login Failed",
        description: "Could not retrieve token. Please try again.",
      });
    } catch (e) {
      setIsGoogleLoading(false);
      console.error("Google login error:", e);
      toast.show({
        variant: "danger",
        label: "Error",
        description: "Google login failed. Please try again.",
      });
    }
  };

  return (
    <View className="flex-1 bg-secondary">
      <KeyboardAwareScrollView
        bottomOffset={100}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center pt-4 pb-8">
          <Image
            source={AppImage}
            resizeMode="contain"
            className="w-full h-[240px]"
          />
        </View>
        <View className="relative flex-1 px-6 pt-5 pb-8 justify-center bg-white rounded-t-4xl">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className="absolute top-6 left-6 z-10"
          >
            <ChevronLeft size={20} color="#000" />
          </TouchableOpacity>

          <Text className="text-3xl font-bold text-center text-gray-800 mb-2">
            Log In
          </Text>
          <Text className="text-sm text-center text-gray-500 mb-8">
            Hi Welcome Back, You've Been Missed.
          </Text>

          <FormInput
            control={control}
            name="phone"
            label="Enter Mobile Number"
            errorMessage={errors.phone?.message}
            prefix="+977"
            keyboardType="phone-pad"
            placeholder="9802783946"
            maxLength={10}
          />
          <FormInput
            control={control}
            name="password"
            label="Password"
            errorMessage={errors.password?.message}
            placeholder="Password"
            secureTextEntry
          />

          <TouchableOpacity
            onPress={() => router.navigate("/(auth)/forgotpassword")}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="self-end mb-6"
          >
            <Text className="text-primary-dark text-sm font-inter-semibold">
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={isPending}
            activeOpacity={0.8}
            className={`bg-primary py-3.5 rounded-xl shadow-sm mb-6 ${
              isPending ? "opacity-70" : ""
            }`}
          >
            {isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-inter-bold text-base">
                Log In
              </Text>
            )}
          </TouchableOpacity>

          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-4 text-gray-400">or</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          <View className="flex-row items-center justify-center mb-6 gap-10">
            <TouchableOpacity>
              <FacebookIcon size={40} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleGoogleLogin}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <GoogleIcon size={40} />
              )}
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center">
            <Text className="text-gray-600">Don't Have Account? </Text>
            <TouchableOpacity
              onPress={() => router.navigate("/(auth)/register")}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text className="text-primary-dark font-inter-bold">
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>

      <RoleSelectionSheet
        roles={availableRoles}
        visible={showRoleSheet}
        onSelect={handleRoleSelect}
        onClose={closeRoleSheet}
      />

      {isNavigating && (
        <View className="absolute inset-0 bg-black/30 z-50 items-center justify-center">
          <View className="bg-white px-8 py-6 rounded-2xl items-center">
            <ActivityIndicator size="large" color="#d7a11b" />
            <Text className="mt-3 text-gray-700 font-medium">
              Setting up...
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default Login;
