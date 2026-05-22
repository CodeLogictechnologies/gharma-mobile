export interface AddToCartBody {
  variationid: string | number;
}

export interface CartItem {
  variation_id: string;
  title: string;
  total_quantity: string;
  total_price: string;
  productprice: string;
  image: string;
}

export interface CartAPIResponse {
  status: "success" | "error";
  message: string;
  data: CartItem[];
}
