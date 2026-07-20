export interface UserProfile {
  username: string;
  email: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  profile_username: string;
  gender: string;
  phone: string;
  address: string;

  company_name?: string;
  tax_number?: string;
  registration_number?: string;
  registration_number_image?: string;
  Pending?: string;
  image: string | null;
  status: "Pending" | "Active" | "Y" | "N";
}

export interface UserProfileResponse {
  type: string;
  message: string;
  data: UserProfile;
}

export type LoyaltyPointResponse = {
  type: string;
  message: string;
  loyalitypoint: string;
};
