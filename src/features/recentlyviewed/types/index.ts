import { Pagination } from "@/types";

export interface ViewedItem {
  variationid: string;
  productid: string;
  title: string;
  value: string;
  price: string;
  image: string;
  viewed_at: string;
}

export interface RecentlyViewedResponse {
  type: "success" | "error";
  message: string;
  data: ViewedItem[];
  pagination: Pagination;
}
