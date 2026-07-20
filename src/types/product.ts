export interface ProductItem {
  productid: string;
  variationid: string;
  title: string;
  images: string[];
  price?: string;

  discount_type: "fixed" | "percentage" | null;
  discount_value: string | null;
  discount_percentage: string | null;
  original_price: string | null;
  wholesaler_price?: WholesalerPrice[];
}

export interface WholesalerPrice {
  price: string;
  min_qty: number;
  max_qty: number;
}
