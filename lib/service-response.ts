import { ServiceResponse, StatusCode } from '@/types/api-response';
import { NextResponse } from 'next/server';

export class ActionResponse {
  static success<T>(
    data: T,
    message = 'success',
    code: StatusCode = 200
  ): ServiceResponse<T> {
    return {
      success: true,
      message,
      code,
      data,
    };
  }

  static error(
    message = 'error',
    code: StatusCode = 400,
    errors?: Record<string, string[]>
  ): ServiceResponse<never> {
    return {
      success: false,
      message,
      code,
      errors,
    };
  }

  /** Convert a ServiceResponse to a NextResponse */
  static toNextResponse<T>(response: ServiceResponse<T>) {
    return NextResponse.json(response, { status: response.code });
  }
}
