export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  GATEWAY_TIMEOUT: 504,
} as const;

export type StatusCode = (typeof HttpStatus)[keyof typeof HttpStatus];

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  code: StatusCode;
  data?: T;
  meta?: {
    pagination?: PaginationMeta;
  };
  errors?: Record<string, string[] | undefined> | null | object;
}
