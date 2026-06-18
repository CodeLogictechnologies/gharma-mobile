import { type Href } from "expo-router";

export interface LoginResponse {
  type: string;
  message: string;
  token: string;
  token_type: string;
  refresh_token: string;
  roles: RoleData[];
}

export interface RoleData {
  roleid: number;
  rolename: string;
}

export interface GoogleAuthResponse {
  type: string;
  url: string;
}

export const roleRoutes: Record<string, Href> = {
  Wholesaler: "/(app)/(tabs)/(home)",
  Driver: "/(driver)",
  Retailer: "/(app)/(tabs)/(home)",
};
