export interface ApiResponse<T> {
  ok: boolean;
  message?: string;
  data?: T;
  error?: string;
  code: number;
}