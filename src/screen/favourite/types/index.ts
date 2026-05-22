export interface FavouriteItem {
  favouriteid: string;
  image: string;
  itemname: string;
  price: string;
  productid: string;
  variationid: string;
}

export interface FavouriteAPIResponse {
  type: "success" | "error";
  message: string;
  favourite: FavouriteItem[];
}

export interface FavouriteItemBody {
  variationid: string | number;
}
