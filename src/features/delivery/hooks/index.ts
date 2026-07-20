import { TRACKING, trackingKeys } from "@/constants/tracking";
import { useQuery } from "@tanstack/react-query";
import { deliveryService } from "../services";
import { DeliverLocationResponse } from "../types";

export const useGetdeliveryLocation = (orderId: string, enabled = true) => {
  return useQuery<DeliverLocationResponse, Error>({
    queryKey: trackingKeys.deliveryLocation(orderId),
    queryFn: () => deliveryService.fetchDeliveryLocation(orderId),
    enabled: !!orderId && enabled,
    refetchInterval: TRACKING.CUSTOMER_POLL_MS,
    refetchIntervalInBackground: false,
    staleTime: TRACKING.CUSTOMER_STALE_MS,
    retry: TRACKING.RETRY_COUNT,
    retryDelay: TRACKING.retryDelay,
  });
};
