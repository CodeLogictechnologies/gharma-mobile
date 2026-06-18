import { request } from "@/api/axios";
import { useQuery } from "@tanstack/react-query";
import { SubcategoriesResponse } from "../types";

export const useGetSubCatrgoryList = (category_id?: string) => {
  return useQuery({
    queryKey: ["GetSubCatrgoryList", category_id],
    queryFn: () =>
      request<SubcategoriesResponse>({
        url: category_id
          ? `/subcategories/list?category_id=${category_id}`
          : `/subcategories/list`,
        method: "GET",
      }),
  });
};
