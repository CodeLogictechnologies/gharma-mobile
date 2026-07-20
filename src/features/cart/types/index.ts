import type { AxiosError } from "axios";

export interface UpdateCartPayload {
  variationid: string | number;
  qty: string;
}

export type CartRequestError = AxiosError<{ message?: string }>;

export interface CartItem {
  variation_id: string;
  productid: string;
  title: string;
  total_quantity: string;
  total_price: string;
  productprice: string;
  original_price_per_unit: string;
  discount_type: "fixed" | "percentage" | null;
  discount_value_per_unit: string | null;
  discount_percentage_per_unit: string | null;
  image: string;
}

export interface CartAPIResponse {
  status: "success" | "error";
  message: string;
  data: CartItem[];
}

export interface Coupon {
  id: string;
  coupon_code: string;
  discount_type: "fixed" | "percentage";
  percentage: string | null;
  value: string | null;
}

export interface CouponsResponse {
  type: "success" | "error" | string;
  message: string;
  data: Coupon[];
}

export interface EsewaInitiatePayload {
  amount: number;
  customer_id?: string;
  remarks?: string;
}

export interface EsewaInitiateResponse {
  success: boolean;
  booking_id: string;
  deeplink: string;
  correlation_id: string;
  transaction_uuid: string;
  message?: string;
}

export interface EsewaStatusPayload {
  booking_id: string;
  correlation_id: string;
}

export interface EsewaStatusResponse {
  status: "BOOKED" | "SUCCESS" | "PENDING" | "FAILED" | "CANCELED" | "REVERTED";
  booking_id: string;
  correlation_id: string;
  transaction_id?: string;
  reference_code?: string;
  message?: string;
}
