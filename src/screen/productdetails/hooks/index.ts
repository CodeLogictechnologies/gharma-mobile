import { request } from "@/api/axios";
import { useQuery } from "@tanstack/react-query";
import { ProductDetailResponse } from "../types";

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
