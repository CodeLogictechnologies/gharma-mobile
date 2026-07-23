import { Pagination } from "@/types";
import { ProductItem } from "@/types/product";

export type { ProductItem, WholesalerPrice } from "@/types/product";

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
  discount_type?: "fixed" | "percentage" | null;
  discount_value?: string | null;
  discount_percentage?: string | null;
  original_price?: string | null;
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

  original_price_per_unit: number;
  discount_type: "fixed" | "percentage" | null;
  discount_value_per_unit: number | null;
  discount_percentage_per_unit: number | null;
}

export interface OrderRequestBody {
  total: number;
  addressid: string;
  paymentmethod: string;
  items: OrderItem[];
}

export interface HomeTabsItem {
  id: string;
  tab_name: string;
  icon_name: string;
  bg_color: string;
}

export interface HomeTabsResponse {
  type: "success" | "error" | string;
  message: string;
  result: HomeTabsItem[];
}
