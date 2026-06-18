import { request } from "@/api/axios";
import { queryClient } from "@/libs/query";
import { CommonAPIResponse } from "@/types";
import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { useToast } from "heroui-native";
import {
  ChangeDeliveryStatusBody,
  CheckOTPBody,
  DileveryDetailsApiResponse,
  DriverOrderListResponse,
  SaveTrackingLocationBody,
} from "../types";

type OrderStatusType = "pending" | "complete";

export const useDriverOrderList = (status: OrderStatusType) => {
  return useInfiniteQuery<
    DriverOrderListResponse,
    Error,
    InfiniteData<DriverOrderListResponse>,
    [string, OrderStatusType],
    number
  >({
    queryKey: ["DriverOrderList", status],
    initialPageParam: 1,
    queryFn: ({ pageParam }: { pageParam: number }) => {
      return request<DriverOrderListResponse>({
        url: `/driver/orderlist?page=${pageParam}&type=${status}`,
        method: "GET",
      });
    },
    getNextPageParam: (lastPage: DriverOrderListResponse) => {
      const pagination = lastPage.result?.pagination;
      if (pagination?.has_more) return pagination.next_page;
      return undefined;
    },
  });
};

// NEW: Accepts array of selected order IDs
export const useDeliveryDetails = (orderIds: string[]) => {
  return useQuery<DileveryDetailsApiResponse, Error>({
    queryKey: ["DeliveryDetails", orderIds],
    queryFn: () => {
      // Join order IDs with comma as per API spec
      const orderids = orderIds.join(",");

      return request<DileveryDetailsApiResponse>({
        url: `/driver/order/customerdetail`,
        method: "GET",
        params: { orderids },
      });
    },
    enabled: orderIds.length > 0,
  });
};

export const useChangeDeliveryStatus = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (body: ChangeDeliveryStatusBody) => {
      const res = await request<CommonAPIResponse>({
        url: `/driver/order/status/change`,
        method: "POST",
        data: body,
      });
      return res;
    },
    onSuccess: (res) => {
      toast.show({
        variant: "success",
        label: "Success",
        description: res?.message,
      });

      queryClient.invalidateQueries({ queryKey: ["DeliveryDetails"] });
      queryClient.invalidateQueries({ queryKey: ["DriverOrderList"] });
    },
    onError: (error: any) => {
      toast.show({
        variant: "danger",
        label: "Error",
        description: error.response?.data?.message ?? error.message,
      });
      console.error("Status Change Error:", error);
    },
  });
};

export const useSaveTrackingLocation = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (body: SaveTrackingLocationBody) => {
      const res = await request<CommonAPIResponse>({
        url: `/save/tracking/location`,
        method: "POST",
        data: body,
      });
      return res;
    },
    onError: (error: any) => {
      console.error("Tracking Location Save Error:", error);
    },
  });
};

export const useCheckOTP = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (body: CheckOTPBody) => {
      const res = await request<CommonAPIResponse>({
        url: `/customer/order/checkotp`,
        method: "POST",
        data: body,
      });
      return res;
    },
    onSuccess: (res) => {
      toast.show({
        variant: "success",
        label: "Success",
        description: res?.message,
      });
    },
    onError: (error: any) => {
      toast.show({
        variant: "danger",
        label: "Error",
        description: error.response?.data?.message ?? error.message,
      });
      console.error("OTP Check Error:", error);
    },
  });
};
