import {
  PrismaForeignKeyConstraintError,
  PrismaOperationFailedError,
  PrismaRecordDoesNotExistError,
  PrismaUniqueConstraintError,
  toTypedPrismaError,
} from '@/lib/prisma-errors';
import { ServiceError } from '@/lib/service-error';
import { ApiResponse, StatusCode } from '@/types/api';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export class ResponseFactory {
  static success<T>(
    data: T,
    message = 'success',
    code: StatusCode = 200
  ): ApiResponse<T> {
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
    errors?: Record<string, string[] | undefined> | null | object
  ): ApiResponse<never> {
    return {
      success: false,
      message,
      code,
      errors,
    };
  }

  static handleError(error: unknown): ApiResponse<never> {
    console.error('Operation failed:', error);

    if (error instanceof ServiceError) {
      return ResponseFactory.error(
        error.message,
        error.statusCode,
        error.errors
      );
    }
    if (error instanceof ZodError) {
      return ResponseFactory.error(
        'Validation Error',
        400,
        error.flatten().fieldErrors
      );
    }

    const prismaError = toTypedPrismaError(error);

    if (prismaError) {
      // Unique Constraint Violation (e.g., Duplicate Email)
      if (prismaError instanceof PrismaUniqueConstraintError) {
        // Extract the field name if possible, e.g. "meta": { "target": [ "email" ] }
        const target =
          (prismaError.meta as { target?: string[] })?.target?.join(', ') ||
          'field';
        return ResponseFactory.error(
          `Value for ${target} already exists.`,
          409 // Conflict
        );
      }

      // P2025: Operation Failed (Commonly "Record to update not found")
      // P2001: Record does not exist
      if (
        prismaError instanceof PrismaOperationFailedError ||
        prismaError instanceof PrismaRecordDoesNotExistError
      ) {
        return ResponseFactory.error('Requested record not found.', 404);
      }

      // Foreign Key Constraint (e.g., Invalid Category ID when creating Product)
      if (prismaError instanceof PrismaForeignKeyConstraintError) {
        const field =
          (prismaError.meta as { field_name?: string })?.field_name ||
          'reference';
        return ResponseFactory.error(
          `Invalid reference: ${field} does not exist.`,
          400 // Bad Request
        );
      }

      // Value too long for column
      if (prismaError.code === 'P2000') {
        return ResponseFactory.error('Input value is too long.', 400);
      }

      // Database Timeout
      if (prismaError.code === 'P1008') {
        return ResponseFactory.error('Database operation timed out.', 504);
      }
    }
    return ResponseFactory.error('Internal Server Error', 500);
  }

  /** Convert a ServiceResponse to a NextResponse */
  static toNextResponse<T>(response: ApiResponse<T>) {
    return NextResponse.json(response, { status: response.code });
  }
}
