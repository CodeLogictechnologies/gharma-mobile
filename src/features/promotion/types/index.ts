export interface PromotionVariation {
  variationid: string;
  productid: string;
  name: string;
  price: string;
}

export interface PromotionProductItem {
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
  variations: PromotionVariation[];
}

export interface PromotionPagination {
  current_page: number;
  next_page: number | null;
  prev_page: number | null;
  last_page: number;
  per_page: number;
  total: number;
  has_more: boolean;
}

export interface PromotionItemsResult {
  data: PromotionProductItem[];
  pagination: PromotionPagination;
}

export interface PromotionItemsResponse {
  type: string;
  message: string;
  result: PromotionItemsResult;
}

export type PromotionAppliesTo = "item" | "category";
