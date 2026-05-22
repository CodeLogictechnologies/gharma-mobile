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
  image: string | null;
  status: "Y" | "N";
}

export interface UserProfileResponse {
  type: string;
  message: string;
  data: UserProfile;
}
