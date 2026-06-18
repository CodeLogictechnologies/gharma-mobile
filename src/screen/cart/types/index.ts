export interface AddToCartBody {
  variationid: string | number;
  qty?: string;
}

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
