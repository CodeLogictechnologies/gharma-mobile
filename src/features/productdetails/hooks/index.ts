import { request } from "@/services/api/client";
import { queryClient } from "@/libs/query";
import { CommonAPIResponse } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ProductDetailResponse, RecentlyViewedBody } from "../types";

export const useProductDetails = (variationid: string) => {
  return useQuery({
    queryKey: ["ProductDetails", variationid],
    queryFn: () =>
      request<ProductDetailResponse>({
        url: `/item/detail/${variationid}`,
        method: "GET",
      }),
  });
};

export const useSaveRecentlyViewed = () => {
  return useMutation({
    mutationFn: async (body: RecentlyViewedBody) => {
      const res = await request<CommonAPIResponse>({
        url: `/recently-viewed/save `,
        method: "POST",
        data: body,
      });
      console.log("res", res);
      return res;
    },
    onSuccess: (res) => {
      console.log("recently viewd res", res);

      queryClient.invalidateQueries({ queryKey: ["RecentlyViewed"] });
    },
    onError: (error: any) => {
      console.error("Profile Update Error:", error);
    },
  });
};
