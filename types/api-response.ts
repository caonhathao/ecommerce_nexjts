export type StatusCode = 200 | 201 | 400 | 401 | 403 | 404 | 500;

export interface ServiceResponse<T = null> {
  success: boolean;
  message: string;
  code: StatusCode;
  data?: T;
  errors?: Record<string, string[]>;
}
