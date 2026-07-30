import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { authApi, type LoginRequest, type RegisterRequest } from "@/api/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<string>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (data: LoginRequest) => {
        set({ isLoading: true });
        try {
          const res = await authApi.login(data);
          set({
            user: res.user,
            token: res.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data: RegisterRequest) => {
        set({ isLoading: true });
        try {
          const res = await authApi.register(data);
          set({ isLoading: false });
          return res.message;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // ignore error on logout
        } finally {
          get().clearAuth();
          window.location.href = "/login";
        }
      },

      fetchUser: async () => {
        set({ isLoading: true });
        try {
          const user = await authApi.me();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch {
          get().clearAuth();
          set({ isLoading: false });
        }
      },

      setToken: (token: string) => {
        set({ token, isAuthenticated: true });
      },

      setUser: (user: User) => {
        set({ user });
      },

      clearAuth: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: "fluxy-auth",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
