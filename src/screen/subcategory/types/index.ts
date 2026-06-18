export interface Subcategory {
  id: string;
  title: string;
  slug: string;
  status: "Y" | "N" | string;
  image: string;
}

export interface SubcategoriesResponse {
  type: "success" | "error" | string;
  message: string;
  result: Subcategory[];
}
