import { request } from "@/api/axios";
import { queryClient } from "@/libs/query";
import { useAuthStore } from "@/store/useAuth";
import { CommonAPIResponse } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "heroui-native";
import {
  HomePageProductResponse,
  OrderRequestBody,
  RecommendationResponse,
} from "../types";

export const useHomePageProductList = (tabName: string) => {
  return useQuery({
    queryKey: ["HomePageProductList", tabName],
    queryFn: () =>
      request<HomePageProductResponse>({
        url: `/items/latest?tab_name=${tabName}`,
        method: "GET",
      }),
  });
};

export const useSearchPageProductList = (search: string, page: number = 1) => {
  return useQuery({
    queryKey: ["SearchPageProductList", search, page],
    queryFn: () =>
      request<HomePageProductResponse>({
        url: `/items/search`,
        method: "GET",
        params: { search, page, per_page: 10 },
      }),
  });
};

export const useUserRecommendationList = () => {
  const token = useAuthStore((s) => s.token);

  console.log("token", token);
  return useQuery({
    queryKey: ["UserRecommendationList"],
    enabled: !!token,
    queryFn: () =>
      request<RecommendationResponse>({
        url: `/items/recommendation`,
        method: "GET",
      }),
  });
};

export const useCheckout = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (body: OrderRequestBody) => {
      console.log("body", body);
      const res = await request<CommonAPIResponse>({
        url: `/order/save`,
        method: "POST",
        data: body,
      });
      return res;
    },
    onSuccess: (res) => {
      toast.show({
        variant: "success",
        label: "Success",
        description: res?.message,
      });

      queryClient.invalidateQueries({ queryKey: ["AddtoCartList"] });
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
