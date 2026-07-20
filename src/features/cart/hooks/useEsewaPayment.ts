import { request } from "@/services/api/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "heroui-native";
import {
  EsewaInitiatePayload,
  EsewaInitiateResponse,
  EsewaStatusPayload,
  EsewaStatusResponse,
} from "../types";

export const useEsewaInitiate = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (body: EsewaInitiatePayload) => {
      const res = await request<EsewaInitiateResponse>({
        url: `/payments/esewa/initiate`,
        method: "POST",
        data: body,
      });
      return res;
    },
    onSuccess: (res) => {
      console.log("eSewa initiate success", res);
    },
    onError: (error: any) => {
      toast.show({
        variant: "danger",
        label: "Error",
        description: error.response?.data?.message ?? error.message,
      });
      console.error("eSewa Initiate Error:", error);
    },
  });
};

export const useEsewaStatus = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (body: EsewaStatusPayload) => {
      const res = await request<EsewaStatusResponse>({
        url: `/payments/esewa/status`,
        method: "POST",
        data: body,
      });
      return res;
    },
    onSuccess: (res) => {
      console.log("eSewa status", res);
    },
    onError: (error: any) => {
      toast.show({
        variant: "danger",
        label: "Error",
        description: error.response?.data?.message ?? error.message,
      });
      console.error("eSewa Status Error:", error);
    },
  });
};

export const usePollEsewaStatus = (
  bookingId: string | null,
  correlationId: string | null,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  },
) => {
  const { enabled = true, refetchInterval = 3000 } = options || {};

  return useQuery({
    queryKey: ["EsewaPaymentStatus", bookingId, correlationId],
    enabled: enabled && !!bookingId && !!correlationId,
    staleTime: 0,
    refetchInterval: (query) => {
      const data = query.state.data as EsewaStatusResponse | undefined;
      if (
        data?.status === "SUCCESS" ||
        data?.status === "FAILED" ||
        data?.status === "CANCELED" ||
        data?.status === "REVERTED"
      ) {
        return false;
      }
      return refetchInterval;
    },
    refetchIntervalInBackground: true,
    queryFn: async () => {
      if (!bookingId || !correlationId) {
        throw new Error("Missing booking_id or correlation_id");
      }
      const res = await request<EsewaStatusResponse>({
        url: `/payments/esewa/status`,
        method: "POST",
        data: {
          booking_id: bookingId,
          correlation_id: correlationId,
        },
      });
      return res;
    },
  });
};
