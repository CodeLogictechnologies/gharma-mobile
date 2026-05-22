import { Pagination } from "@/types";

export interface ProductItem {
  productid: string;
  variationid: string;
  title: string;
  price: string;
  images: string[];
}

export interface ProductListResult {
  data: ProductItem[];
  pagination: Pagination;
}

export type HomePageProductResponse = {
  type: string;
  message: string;
  result: ProductListResult;
};



export interface RecommendationData {
  images: string[] | null;
  item_id: string;
  price: string;
  title: string;
  total_orders: number;
  total_qty: number;
  value: string;
  variation_id: string;
}

export interface Recommendation {
  is_personalized: boolean;
  data: RecommendationData[];
  pagination: Pagination;
}

export interface RecommendationResponse {
  message: string;
  result: Recommendation;
  type: string;
}

export interface OrderItem {
  variation_id: string;
  quantity: number;
  price: number;
}

export interface OrderRequestBody {
  total: number;
  addressid: string;
  items: OrderItem[];
}
