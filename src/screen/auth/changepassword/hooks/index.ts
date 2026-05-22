import { request } from "@/api/axios";
import { CommonAPIResponse } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "heroui-native";
import { ChangePasswordFormData } from "../ChangePassword";

export const useChangePassword = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (body: ChangePasswordFormData) => {
      const res = await request<CommonAPIResponse>({
        url: `/change/password`,
        method: "PUT",
        data: body,
      });
      return res;
    },
    onSuccess: (res) => {
      console.log("change password res", res);
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
      console.error(
        "Login Error:",
        error.response?.data?.message ?? error.message,
      );
    },
  });
};
