export interface ProductSearchWordsResponse {
  type: string;
  message: string;
  recommendations: Recommendation[];
}

interface Recommendation {
  text: string;
  searchid: string;
}

export interface SaveSearchWordsBody {
  search: string;
}
