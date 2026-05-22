export interface CommonAPIResponse {
  type: string;
  message: string;
}

export interface Pagination {
  current_page: number;
  next_page: number | null;
  prev_page: number | null;
  last_page: number;
  per_page: number;
  total: number;
  has_more: boolean;
}
