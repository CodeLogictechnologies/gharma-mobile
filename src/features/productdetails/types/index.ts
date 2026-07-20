export interface ProductDetailResponse {
  type: string;
  message: string;
  details: ProductDetails;
}

export interface ProductDetails {
  description: string;
  images: string[];
  is_favourite: boolean;
  price: string;
  productid: string;
  title: string;
  variationid: string;
  variations: ProductVariation[];
}

interface ProductVariation {
  name: string;
  variationid: string;
  productid: string;
  price: string;
}

export interface RecentlyViewedBody {
  variationid: string | number;
}
