import { request } from "@/services/api/client";
import { useAuthStore } from "@/store/useAuth";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useToast } from "heroui-native";
import { LoginFormData } from "../Login";
import { GoogleAuthResponse, LoginResponse } from "../types";

export type LoginPayload = LoginFormData & {
  devicetoken: string | null;
};

export const useLogin = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (body: LoginPayload) => {
      const res = await request<LoginResponse>({
        url: `/login`,
        method: "POST",
        data: body,
      });
      return res;
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
      logOut();
      toast.show({
        variant: "success",
        label: "Success",
        description: res?.message,
      });
      router.replace("/(auth)/login");
    },
    onError: (error: any) => {
      logOut();
      toast.show({
        variant: "danger",
        label: "Error",
        description: error.response?.data?.message ?? error.message,
      });
      console.error("Logout Error:", error.message);
    },
  });
};

export const useGoogleLogin = () => {
  const redirectUri = Linking.createURL("call-back");

  return useQuery({
    queryKey: ["google_auth", redirectUri],
    queryFn: () =>
      request<GoogleAuthResponse>({
        url: `/auth/google/redirect`,
        method: "GET",
        params: {
          redirect_uri: redirectUri,
        },
      }),
    enabled: false,
  });
};
