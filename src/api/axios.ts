// api/axios.ts
import Axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "../store/useAuth";

// 👇 Separate instance for refresh token — NO interceptors
const refreshApi = Axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Main API instance with interceptors
const api = Axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (newToken: string) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = useAuthStore.getState().refresh_token;

  if (!refreshToken) {
    useAuthStore.getState().logOut();
    return null;
  }

  try {
    // 👇 Use refreshApi instead of api to avoid interceptor attaching access token
    const res = await refreshApi.post<{
      type: string;
      token: string;
      refresh_token: string;
      token_type: string;
    }>(
      "/refresh",
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      },
    );

    if (res.data?.token) {
      useAuthStore.getState().setToken(res.data.token);
      if (res.data.refresh_token) {
        useAuthStore.getState().setRefreshToken(res.data.refresh_token);
      }
      return res.data.token;
    }

    return null;
  } catch (error: any) {
    console.log("Refresh token failed", error.response?.data);
    useAuthStore.getState().logOut();
    return null;
  }
};

// Request interceptor: attach access token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token;
  const roleId = useAuthStore.getState().role_id;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (roleId) {
    config.headers["roleid"] = String(roleId);
  }

  return config;
});

// Response interceptor: handle 401 and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    const status = error.response?.status;
    const url = error.config?.url ?? "";

    const isAuthEndpoint =
      url.includes("/login") ||
      url.includes("/register") ||
      url.includes("/auth/") ||
      url === "/refresh";

    if (status === 401 && isAuthEndpoint) {
      return Promise.reject(error);
    }

    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken: string) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();

        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          onTokenRefreshed(newToken);
          return api(originalRequest);
        }
      } catch (refreshError) {
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const res = await api.request<T>(config);
  return res.data;
}

export default api;
