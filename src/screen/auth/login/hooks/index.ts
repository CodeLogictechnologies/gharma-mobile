import { request } from "@/api/axios";
import { syncAndClearGuestAddress } from "@/screen/address/libs";
import { syncAndClearGuestCart } from "@/screen/cart/libs/syncGuestCart";
import { useAuthStore } from "@/store/useAuth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useToast } from "heroui-native";
import { LoginFormData } from "../Login";
import { GoogleAuthResponse, LoginResponse } from "../types";

export const useLogin = () => {
  const { toast } = useToast();

  const logIn = useAuthStore((state) => state.logIn);
  return useMutation({
    mutationFn: async (body: LoginFormData) => {
      const res = await request<LoginResponse>({
        url: `/login`,
        method: "POST",
        data: body,
      });
      return res;
    },
    onSuccess: async (res) => {
      console.log("login res", res);
      if (res.token) {
        logIn(res.token);

        await Promise.all([
          syncAndClearGuestAddress(),
          syncAndClearGuestCart(),
        ]);

        toast.show({
          variant: "success",
          label: "Success",
          description: res?.message,
        });
        router.navigate("/(app)/(tabs)/(home)");
      }

      //   queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (error: any) => {
      toast.show({
        variant: "danger",
        label: "Login Failed",
        description: error.response?.data?.message ?? error.message,
      });

      console.error("Login Error:", error.message);
    },
  });
};

export const useLogOut = () => {
  const { toast } = useToast();

  const logOut = useAuthStore((state) => state.logOut);
  return useMutation({
    mutationFn: async () => {
      const res = await request<LoginResponse>({
        url: `/logout`,
        method: "POST",
      });
      return res;
    },
    onSuccess: (res) => {
      console.log("login res", res);
      logOut();

      toast.show({
        variant: "success",
        label: "Success",
        description: res?.message,
      });

      router.replace("/(auth)/login");

      //   queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (error: any) => {
      logOut();
      toast.show({
        variant: "danger",
        label: "Error",
        description: error.response?.data?.message ?? error.message,
      });
      console.error("Login Error:", error.message);
    },
  });
};

export const useGoogleLogin = () => {
  return useQuery({
    queryKey: ["google_auth"],
    queryFn: () =>
      request<GoogleAuthResponse>({
        url: `/auth/google/redirect`,
        method: "GET",
      }),
    enabled: false,
  });
};
