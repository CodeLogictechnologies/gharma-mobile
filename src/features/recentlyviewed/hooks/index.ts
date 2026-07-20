import { request } from "@/services/api/client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { RecentlyViewedResponse } from "../types";

export const useRecentlyViewed = () => {
  return useInfiniteQuery({
    queryKey: ["RecentlyViewed"],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await request<RecentlyViewedResponse>({
        url: `/recently-viewed`,
        method: "GET",
        params: {
          page: pageParam,
          per_page: 10,
        },
      });
      return res;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.has_more && lastPage.pagination.next_page) {
        return lastPage.pagination.next_page;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
};
