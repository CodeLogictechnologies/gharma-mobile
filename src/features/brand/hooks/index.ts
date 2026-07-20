import { request } from "@/services/api/client";
import { useQuery } from "@tanstack/react-query";
import { BrandAPIResponse } from "../types";

export const useBrandList = () => {
  return useQuery({
    queryKey: ["BrandList"],

    queryFn: () =>
      request<BrandAPIResponse>({
        url: `/brands`,
        method: "GET",
      }),
  });
};
