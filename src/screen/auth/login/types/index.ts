export interface LoginResponse {
  type: string;
  message: string;
  token: string;
  token_type: string;
}

export interface GoogleAuthResponse {
  type: string;
  url: string;
}
