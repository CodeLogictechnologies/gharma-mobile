import { request } from "@/services/api/client";
import { goToHome } from "@/libs/router";
import { useAuthStore } from "@/store/useAuth";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "heroui-native";
import { RetailerFormData, WholesalerFormData } from "../Register";
import { RetailerRegisterResponse } from "../types";

export const useRetailerRegister = () => {
  const { toast } = useToast();
  const logIn = useAuthStore((state) => state.logIn);

  return useMutation({
    mutationFn: async (data: RetailerFormData) => {
      const formData = new FormData();

      Object.keys(data).forEach((key) => {
        const value = data[key as keyof RetailerFormData];
        if (key !== "image" && value !== undefined && value !== null) {
          formData.append(key, value as string);
        }
      });

      if (data.image) {
        const uri = data.image;
        const fileName = uri.split("/").pop();
        const match = /\.(\w+)$/.exec(fileName || "");
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        // @ts-ignore - Required structure for RN FormData
        formData.append("image", {
          uri,
          name: fileName || "upload.jpg",
          type,
        });
      }

      return await request<RetailerRegisterResponse>({
        url: `/retailer/register`,
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: (res) => {
      console.log("res", res);
      if (res.token) {
         // @ts-ignore - Required structure for RN FormData
        logIn(res.token);
        goToHome();
        toast.show({
          variant: "success",
          label: "Success",
          description: res?.message,
        });
      }
    },
    onError: (error: any) => {
      toast.show({
        variant: "danger",
        label: "Error",
        description: error.response?.data?.message ?? error.message,
      });
      console.error(
        "Registration Error:",
        error.response?.data?.message ?? error.message,
      );
    },
  });
};

export const useWholesalerRegister = () => {
  const { toast } = useToast();

  const logIn = useAuthStore((state) => state.logIn);

  return useMutation({
    mutationFn: async (data: WholesalerFormData) => {
      const formData = new FormData();

      Object.keys(data).forEach((key) => {
        const value = data[key as keyof WholesalerFormData];
        if (key !== "image" && value !== undefined && value !== null) {
          formData.append(key, value as string);
        }
      });

      if (data.image) {
        const uri = data.image;
        const fileName = uri.split("/").pop();
        const match = /\.(\w+)$/.exec(fileName || "");
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        // @ts-ignore - Required structure for RN FormData
        formData.append("image", {
          uri,
          name: fileName || "upload.jpg",
          type,
        });
      }

      return await request<RetailerRegisterResponse>({
        url: `/wholesaler/register`,
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: (res) => {
      console.log("res", res);
      if (res.token) {
         // @ts-ignore - Required structure for RN FormData
        logIn(res.token);
        goToHome();
        toast.show({
          variant: "success",
          label: "Success",
          description: res?.message,
        });
      }
    },
    onError: (error: any) => {
      toast.show({
        variant: "danger",
        label: "Login Failed",
        description: error.response?.data?.message ?? error.message,
      });
      console.error(
        "Registration Error:",
        error.response?.data?.message ?? error.message,
      );
    },
  });
};
