import { request } from "@/api/axios";
import { useQuery } from "@tanstack/react-query";
import { DeliverLocationResponse } from "../types";

export const useGetdeliveryLocation = (orderId: string) => {
  return useQuery({
    queryKey: ["GetdeliveryLocation", orderId],
    queryFn: () =>
      request<DeliverLocationResponse>({
        url: `/driver/lastest/location?order_id=${orderId}`,
        method: "GET",
      }),

    refetchInterval: 60000,
    refetchIntervalInBackground: true,
    staleTime: 30000,
    enabled: !!orderId,
  });
};
