import { request } from "@/services/api/client";
import { DeliverLocationResponse } from "../types";

export const deliveryService = {
  fetchDeliveryLocation: (orderId: string) =>
    request<DeliverLocationResponse>({
      url: `/driver/lastest/location?order_id=${orderId}`,
      method: "GET",
    }),
};
