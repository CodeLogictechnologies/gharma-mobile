import { request } from "@/api/axios";
import { useQuery } from "@tanstack/react-query";
import { ProductByBarcodeResponse } from "../types";



export const useProductByBarcode = (product_code: string) => {
  return useQuery({
    queryKey: ["ProductByBarcode", product_code],
    queryFn: () =>
      request<ProductByBarcodeResponse>({
        url: `/item/by-product-code/${product_code}`,
        method: "GET",
      }),
    enabled: !!product_code && product_code.length > 0,
  });
};
