import { Pagination } from "@/types";

export interface OrderItem {
  productname: string;
  variation: string;
  image: string;
  quantity: number;
  price: number;
  order_status: string;
  time: string | null;
  orderid: string;
}

export interface OrderHistoryResponse {
  type: "success" | "error";
  message: string;
  data: OrderItem[];
  pagination: Pagination;
}
