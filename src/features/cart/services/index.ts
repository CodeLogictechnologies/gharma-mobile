import { request } from "@/services/api/client";
import { CommonAPIResponse } from "@/types";
import { CartAPIResponse, CouponsResponse, UpdateCartPayload } from "../types";

export const cartService = {
  fetchCartList: () =>
    request<CartAPIResponse>({
      url: `/cart/list`,
      method: "GET",
    }),

  fetchCoupons: () =>
    request<CouponsResponse>({
      url: `/coupon/list`,
      method: "GET",
    }),

  updateCartItem: (payload: UpdateCartPayload, signal?: AbortSignal) =>
    request<CommonAPIResponse>({
      url: `/addtocart`,
      method: "PUT",
      data: payload,
      signal,
    }),

  deleteCartItem: (variationId: string | number) =>
    request<CommonAPIResponse>({
      url: `/cart/delete/${variationId}`,
      method: "DELETE",
    }),
};
