import { Pagination } from "@/types";

export interface Order {
  order_id: string;
  customer_name: string;
  phone: string;
  address_name: string;
  longitude: string;
  latitude: string;
  order_date: string;
  total_price: string;
  assignorderid: string;
  assigned_at: string;
  order_status: "Pending" | "Accepted" | "Delivered" | "Cancelled" | string;
}

export interface DeliveryGroup {
  delivery_date: string;
  orders: Order[];
}

export interface OrdersResult {
  data: DeliveryGroup[];
  pagination: Pagination;
}

export interface DriverOrderListResponse {
  type: "success" | "error";
  message: string;
  result: OrdersResult;
}

export interface CustomerOrderDetail {
  order_id: string;
  customer_name: string;
  phone: string;
  address_name: string;
  longitude: string;
  latitude: string;
  order_date: string;
  total_price: string;
  assignorderid: string | null;
  assigned_at: string | null;
  order_status:
    | "Pending"
    | "Dispatched"
    | "Delivered"
    | "Cancelled"
    | "start"
    | "complete";
}

export interface DileveryDetailsApiResponse {
  type: "success" | "error";
  message: string;
  data: CustomerOrderDetail[];
}

export interface ChangeDeliveryStatusBody {
  status: "Start" | "Complete";
  assignorderid: string;
  order_id: string;
  latitude?: string;
  longitude?: string;
}

export interface CheckOTPBody {
  otp: string;
  order_id: string;
}

export interface SaveTrackingLocationBody {
  latitude: string;
  longitude: string;
  order_id: string;
}

export type SelectedOrdersMap = Record<string, boolean>; 