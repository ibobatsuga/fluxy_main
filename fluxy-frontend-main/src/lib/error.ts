import axios from "axios";

/**
 * Mengekstrak pesan error dari AxiosError atau Error biasa.
 * AxiosError.message hanya berisi "Request failed with status code XXX" —
 * pesan yang bermakna dari API ada di error.response.data.message.
 */
export function getErrorMessage(error: unknown, fallback = "Terjadi kesalahan. Silakan coba lagi."): string {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      fallback
    );
  }
  if (error instanceof Error) {
    return error.message || fallback;
  }
  return fallback;
}
