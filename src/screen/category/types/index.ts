export interface Category {
  categortid: string;
  title: string;
  image: string;
}

export interface CategoriesResponse {
  type: string;
  message: string;
  categories: Category[];
}