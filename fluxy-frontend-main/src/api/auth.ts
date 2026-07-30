import api from "@/lib/axios";
import type { User } from "@/types";
import type { ApiResponse } from "@/types/api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  business_name: string;
  industry_category: string;
  timezone?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await api.post<ApiResponse<LoginResponse>>("/v1/auth/login", data);
    return res.data.data;
  },

  register: async (data: RegisterRequest): Promise<{ message: string }> => {
    const res = await api.post<ApiResponse<{ message: string }>>("/v1/auth/register", data);
    return res.data.data;
  },

  me: async (): Promise<User> => {
    const res = await api.get<ApiResponse<User>>("/v1/auth/me");
    return res.data.data;
  },

  logout: async (): Promise<void> => {
    await api.post("/v1/auth/logout");
  },

  setPassword: async (data: { password: string; password_confirmation: string }): Promise<void> => {
    await api.post("/v1/auth/password", data);
  },

  getGoogleRedirect: async (): Promise<{ url: string }> => {
    const res = await api.get<ApiResponse<{ url: string }>>("/v1/auth/google/redirect");
    return res.data.data;
  },
};
