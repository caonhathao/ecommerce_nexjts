export type StatusCode = 200 | 201 | 400 | 401 | 403 | 404 | 409 | 500 | 504;
export const StatusCodeIdentify = {
  success: 200,
  created: 201,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  conflict: 409,
  internalServerError: 500,
  gatewayTimeout: 504,
} as const;

export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  code: StatusCode;
  data?: T;
  errors?: Record<string, string[] | undefined> | null | object;
}
