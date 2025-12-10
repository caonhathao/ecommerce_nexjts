import { StatusCode } from '@/types/api';

export class ServiceError extends Error {
  public statusCode: StatusCode;
  public errors?: Record<string, string[] | undefined> | null | object;

  constructor(
    message: string,
    code: StatusCode = 400,
    errors?: Record<string, string[] | undefined> | null | object
  ) {
    super(message);
    this.statusCode = code;
    this.errors = errors;
    this.name = 'ServiceError';

    // Maintain proper stack trace (only needed if targeting older JS environments, but good practice)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ServiceError);
    }
  }
}
