import FormInput from "@/components/common/FormInput";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { ChevronLeft, X } from "lucide-react-native";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import * as yup from "yup";
import AppImage from "~/assets/images/app-main.png";
import FacebookIcon from "~/assets/images/icon/FacebookIcon";
import GoogleIcon from "~/assets/images/icon/GoogleIcon";
import { useGoogleLogin, useLogin } from "./hooks";

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

const Login = () => {
  const [authUrl, setAuthUrl] = useState<string | null>(null);
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

  const onSubmit = async (data: LoginFormData) => {
    console.log("data", data);
    mutate(data);
  };

  const { refetch: fetchGoogleAuth, isFetching: isGoogleLoading } =
    useGoogleLogin();

  const handleGoogleLogin = async () => {
    const result = await fetchGoogleAuth();
    console.log("result", result?.data?.url);
    if (result.data?.url) {
      // setAuthUrl(result.data.url);
      await WebBrowser.openBrowserAsync(result.data.url);
    }
  };

  if (authUrl) {
    return (
      <View className="flex-1">
        <TouchableOpacity
          onPress={() => setAuthUrl(null)}
          className="p-4 bg-gray-100"
        >
          <Text>
            <X />
          </Text>
        </TouchableOpacity>
        <WebView
          source={{ uri: authUrl }}
          onNavigationStateChange={(navState) => {
            if (navState.url.includes("call-back")) {
              console.log("Login finished, navigate user home...");
              setAuthUrl(null);
            }
          }}
        />
      </View>
    );
  }
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-secondary"
    >
      <ScrollView
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
        <View className="relative flex-1 px-6 pt-5 pb-8 justify-center bg-white rounder rounded-t-4xl">
          <TouchableOpacity
            onPress={() => router.back()}
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
            onPress={() => {
              router.navigate("/(auth)/forgotpassword");
            }}
            className="self-end mb-6"
          >
            <Text className="text-primary text-sm font-medium">
              Forgot Password?
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={isPending}
            className={`bg-primary py-2.5 rounded-md mb-6 ${
              isPending ? "opacity-70" : ""
            }`}
          >
            {isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-semibold text-base">
                Log In
              </Text>
            )}
          </TouchableOpacity>
          {/* <Button variant="primary">
            <Button.Label>Click Me</Button.Label>
          </Button> */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-4 text-gray-400">or</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>
          <View className="flex-row items-center justify-center mb-6 gap-10">
            <TouchableOpacity>
              <FacebookIcon size={40} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleGoogleLogin}>
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
              onPress={() => {
                router.navigate("/(auth)/registerretailer");
              }}
            >
              <Text className="text-[#369FC6] font-semibold">
                registerretailer
              </Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row justify-center">
            <Text className="text-gray-600">Don't Have Account? </Text>
            <TouchableOpacity
              onPress={() => {
                router.navigate("/(auth)/wholesalerregister");
              }}
            >
              <Text className="text-[#369FC6] font-semibold">
                wholesalerregister
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;
