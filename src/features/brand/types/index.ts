export interface Brand {
  id: string;
  name: string;
  description: string | null;
  logo: string;
  slug: string;
  image_url: string;
}

export interface BrandAPIResponse {
  status: boolean;
  message: string;
  data: Brand[];
}
