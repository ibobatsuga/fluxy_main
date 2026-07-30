interface ApiResponse<T> {
  data: T;
}

interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export type { ApiResponse, ApiError, PaginatedResponse };
