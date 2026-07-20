import { request } from "@/services/api/client";
import { useQuery } from "@tanstack/react-query";
import { CategoriesResponse } from "../types";

export const useGetCatrgoryList = () => {
  return useQuery({
    queryKey: ["GetCatrgoryList"],
    queryFn: () =>
      request<CategoriesResponse>({
        url: `/categories/list`,
        method: "GET",
      }),
  });
};
