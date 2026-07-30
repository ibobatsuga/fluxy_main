import axios from "axios";
import { useAuthStore } from "@/stores/auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false,
});

// Will be called from main.tsx to setup mock adapter
export async function initApi(): Promise<void> {
  if (import.meta.env.VITE_USE_MOCK === "true") {
    const { setupMock } = await import("@/lib/mock/setup");
    setupMock(api);
    console.log(
      "%c[MOCK] API mocking enabled — no backend required",
      "color: #7c3aed; font-weight: bold;"
    );
  }
}

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Guard: mencegah logout() dipanggil berkali-kali saat ada banyak request 401 bersamaan
let isLoggingOut = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const authStore = useAuthStore.getState();

    if (status === 401 && !isLoggingOut) {
      isLoggingOut = true;
      authStore.logout().finally(() => {
        isLoggingOut = false;
      });
      // Tidak perlu window.location.href di sini — logout() sudah menanganinya
    }

    if (status === 403) {
      const message = error.response?.data?.message || "";
      if (message.includes("not approved") || message.includes("pending")) {
        window.location.href = "/pending-approval";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
