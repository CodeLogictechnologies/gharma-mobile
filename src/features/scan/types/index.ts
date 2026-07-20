export interface ProductByBarcodeResult {
  productid: string;
  title: string;
  product_code: string;
  description: string | null;
  type: string;
  brand: string;
  images: string[];
}

export interface ProductByBarcodeResponse {
  type: "success" | "error";
  message: string;
  result: ProductByBarcodeResult;
}
