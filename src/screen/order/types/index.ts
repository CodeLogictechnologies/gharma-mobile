export interface OrderItem {
  productname: string;
  variation: string;
  image: string;
  quantity: number;
  price: number;
  order_status: string;
  time: string | null;
}

export interface OrderHistoryResponse {
  type: "success" | "error";
  message: string;
  data: OrderItem[];
}
