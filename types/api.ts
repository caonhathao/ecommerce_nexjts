export type StatusCode = 200 | 201 | 400 | 401 | 403 | 404 | 409 | 500 | 504;

export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  code: StatusCode;
  data?: T;
  errors?: Record<string, string[] | undefined> | null | object;
}
