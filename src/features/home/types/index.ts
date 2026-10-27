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
  price_before_discount: string;
  price_after_discount: string;
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

export interface PromotionsListResponse {
  type: string;
  message: string;
  result: Promotion[];
}

export interface ProductVariation {
  variationid: string;
  productid: string;
  name: string;
  price: string;
}

export interface PromotionItem {
  productid: string;
  variationid: string;
  title: string;
  brand_id: string;
  price: string;
  images: string[];
  discount_type: string | null;
  discount_value: number | string | null;
  discount_percentage: number | string | null;
  price_before_discount: string;
  price_after_discount: string;
  variations: ProductVariation[];
}

export interface Promotion {
  id: string;
  name: string;
  image: string;
  bg_color: string;
  applies_to: "item" | "category" | string;
  items: PromotionItem[];
}
