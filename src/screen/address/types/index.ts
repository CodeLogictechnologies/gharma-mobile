export interface Address {
  id: string;
  type: "home" | "work" | string;
  address_name: string;
  status: "Y" | "N";
  longitude: string;
  latitude: string;
}

export interface CustomerAddressResponse {
  type: "success" | "error";
  message: string;
  address: Address[];
}

export interface ShopAddress {
  coordinates: {
    latitude: number | null;
    longitude: number | null;
  };
}

export interface ShopAddressResponse {
  type: "success" | "error";
  message: string;
  data: ShopAddress[];
}

export interface SaveAddressPayload {
  title: string;
  name: string;
  address_name: string;
  latitude: string;
  longitude: string;
  type: string;
  other_address_name: string;
}
