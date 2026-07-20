import { request } from "@/services/api/client";
import { queryClient } from "@/libs/query";
import { useAuthStore } from "@/store/useAuth";
import { CommonAPIResponse } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "heroui-native";
import {
  CustomerAddressResponse,
  SaveAddressPayload,
  ShopAddressResponse,
} from "../types";

export const useCustomerAddress = () => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["CustomerAddress"],
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
    queryFn: () =>
      request<CustomerAddressResponse>({
        url: `/user/address/fetch`,
        method: "GET",
      }),
  });
};

export const useGetShopAddress = () => {
  return useQuery({
    queryKey: ["ShopAddress"],
    queryFn: () =>
      request<ShopAddressResponse>({
        url: `/stores`,
        method: "GET",
      }),
  });
};

export const useSaveUserAddress = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (body: SaveAddressPayload) => {
      const res = await request<CommonAPIResponse>({
        url: `/user/address/save`,
        method: "POST",
        data: body,
      });
      console.log("res", res);
      return res;
    },
    onSuccess: (res) => {
      console.log("login res", res);

      toast.show({
        variant: "success",
        label: "Success",
        description: res?.message,
      });

      queryClient.invalidateQueries({ queryKey: ["CustomerAddress"] });
    },
    onError: (error: any) => {
      toast.show({
        variant: "danger",
        label: "Error",
        description: error.response?.data?.message ?? error.message,
      });

      console.error("Profile Update Error:", error);
    },
  });
};

export const useDeleteUserAddress = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await request<CommonAPIResponse>({
        url: `/user/address/delete/${id}`,
        method: "DELETE",
      });
      return res;
    },
    onSuccess: (res) => {
      toast.show({
        variant: "success",
        label: "Success",
        description: res?.message,
      });

      queryClient.invalidateQueries({ queryKey: ["CustomerAddress"] });
    },
    onError: (error: any) => {
      toast.show({
        variant: "danger",
        label: "Error",
        description: error.response?.data?.message ?? error.message,
      });

      console.error("Error:", error.message);
    },
  });
};
