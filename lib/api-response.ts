import { NextResponse } from 'next/server';

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  statusCode: number;
};

// Helper function to create standardized API responses
export function createApiResponse<T>({
  success,
  data,
  message,
  error,
  statusCode = 200,
}: Omit<ApiResponse<T>, 'statusCode'> & { statusCode?: number }) {
  return NextResponse.json(
    {
      success,
      ...(data && { data }),
      ...(message && { message }),
      ...(error && { error }),
    },
    { status: statusCode }
  );
}

// Success response
export function successResponse<T>(
  data: T,
  message: string = 'Success',
  statusCode: number = 200
) {
  return createApiResponse({
    success: true,
    data,
    message,
    statusCode,
  });
}

// Error response
export function errorResponse(
  error: string,
  statusCode: number = 400,
  data?: any
) {
  return createApiResponse({
    success: false,
    error,
    data,
    statusCode,
  });
}

// Not found response
export function notFoundResponse(message: string = 'Resource not found') {
  return createApiResponse({
    success: false,
    error: message,
    statusCode: 404,
  });
}

// Unauthorized response
export function unauthorizedResponse(message: string = 'Unauthorized access') {
  return createApiResponse({
    success: false,
    error: message,
    statusCode: 401,
  });
}

// Forbidden response
export function forbiddenResponse(message: string = 'Forbidden access') {
  return createApiResponse({
    success: false,
    error: message,
    statusCode: 403,
  });
}