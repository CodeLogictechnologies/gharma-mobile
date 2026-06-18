import { request } from "@/api/axios";
import { useAuthStore } from "@/store/useAuth";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { OrderHistoryResponse } from "../types";

export const useOrderHistoryList = () => {
  const token = useAuthStore((s) => s.token);

  return useInfiniteQuery({
    queryKey: ["OrderHistoryList"],
    enabled: !!token,
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) =>
      request<OrderHistoryResponse>({
        url: `/user/order/history`,
        method: "GET",
        params: { page: pageParam },
      }),
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.pagination;
      if (pagination?.has_more && pagination?.next_page) {
        return pagination.next_page;
      }
      return undefined;
    },
  });
};