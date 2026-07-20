import { queryClient } from "@/libs/query";
import { request } from "@/services/api/client";
import { useAuthStore } from "@/store/useAuth";
import { CommonAPIResponse } from "@/types";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "heroui-native";
import {
  HomePageProductResponse,
  HomeTabsResponse,
  OrderRequestBody,
  RecommendationResponse,
} from "../types";

type HomePageProductList = {
  tab_id?: string;
  category_id?: string;
  subcategory_id?: string;
  brand_id?: string;
};

export const useHomePageProductList = ({
  tab_id,
  category_id,
  subcategory_id,
  brand_id,
}: HomePageProductList) => {
  return useInfiniteQuery({
    queryKey: [
      "HomePageProductList",
      tab_id,
      category_id,
      subcategory_id,
      brand_id,
    ],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => {
      const queryParams: Record<string, string> = {
        page: String(pageParam),
      };

      if (tab_id) queryParams.tab_id = tab_id;
      if (category_id) queryParams.category_id = String(category_id);
      if (subcategory_id) queryParams.subcategory_id = String(subcategory_id);
      if (brand_id) queryParams.brand_id = String(brand_id);

      const params = new URLSearchParams(queryParams);

      return request<HomePageProductResponse>({
        url: `/items/latest?${params.toString()}`,
        method: "GET",
      });
    },
    getNextPageParam: (lastPage) => {
      const pagination = lastPage.result?.pagination;
      if (pagination?.has_more) return pagination.next_page;
      return undefined;
    },
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

export const useUserRecommendationList = ({ tab_id }: { tab_id: string }) => {
  const token = useAuthStore((s) => s.token);

  return useInfiniteQuery({
    queryKey: ["UserRecommendationList", tab_id],
    enabled: !!token,
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) =>
      request<RecommendationResponse>({
        url: `/items/recommendation`,
        method: "GET",
        params: { page: pageParam, tab_id },
      }),
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.result?.pagination;
      if (pagination?.has_more && pagination?.next_page) {
        return pagination.next_page;
      }
      return undefined;
    },
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

export const useHomeTabList = () => {
  return useQuery({
    queryKey: ["HomeTabList"],
    queryFn: () =>
      request<HomeTabsResponse>({
        url: `/home`,
        method: "GET",
      }),
    select: (data) => {
      const allTab = {
        id: "",
        tab_name: "All",
        icon_name: "ShoppingBag",
        bg_color: "#FFEDD4",
      };
      return {
        ...data,
        result: [allTab, ...(data.result ?? [])],
      };
    },
  });
};
