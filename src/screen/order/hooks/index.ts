import { request } from "@/api/axios";
import { useAuthStore } from "@/store/useAuth";
import { useQuery } from "@tanstack/react-query";
import { OrderHistoryResponse } from "../types";

export const useOrderHistoryList = () => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["OrderHistoryList"],
    enabled: !!token,
    queryFn: () =>
      request<OrderHistoryResponse>({
        url: `/user/order/history`,
        method: "GET",
      }),
  });
};
