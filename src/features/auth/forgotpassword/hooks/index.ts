import { request } from "@/services/api/client";
import { CommonAPIResponse } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "heroui-native";
import { ForgotPasswordFormData } from "../ForgotPassword";
import { ResetPasswordFormData } from "../ResetPassword";
import { VerifyOTPFormData } from "../VerifyOTP";

export const useForgotPassword = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (body: ForgotPasswordFormData) => {
      const res = await request<CommonAPIResponse>({
        url: `/send-otp`,
        method: "POST",
        data: body,
      });
      return res;
    },
    onSuccess: (res) => {
      console.log("forget pw res", res);
      toast.show({
        variant: "success",
        label: "Success",
        description: res?.message,
      });
      //   queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (error: any) => {
      toast.show({
        variant: "danger",
        label: "Error",
        description: error.response?.data?.message ?? error.message,
      });
      console.error("Login Error:", error.message);
    },
  });
};

export const useVerifyOTP = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (body: VerifyOTPFormData) => {
      const res = await request<CommonAPIResponse>({
        url: `/verify-otp`,
        method: "POST",
        data: body,
      });
      return res;
    },
    onSuccess: (res) => {
      console.log("verify otp res", res);
      toast.show({
        variant: "success",
        label: "Success",
        description: res?.message,
      });
      //   queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (error: any) => {
      toast.show({
        variant: "danger",
        label: "Error",
        description: error.response?.data?.message ?? error.message,
      });
      console.error("Verify OTP Error:", error.message);
    },
  });
};

export const useResetPassword = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (body: ResetPasswordFormData) => {
      const res = await request<CommonAPIResponse>({
        url: `/reset-password`,
        method: "POST",
        data: body,
      });
      return res;
    },
    onSuccess: (res) => {
      console.log("reset password res", res);
      toast.show({
        variant: "success",
        label: "Success",
        description: res?.message,
      });
      //   queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (error: any) => {
      toast.show({
        variant: "danger",
        label: "Error",
        description: error.response?.data?.message ?? error.message,
      });
      console.error("Login Error:", error.message);
    },
  });
};
