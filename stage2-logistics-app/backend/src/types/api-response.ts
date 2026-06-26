export type ErrorPayload = {
  code: string;
  message: string;
  statusCode?: number;
};

export type ApiResponse<T> = {
  error: ErrorPayload | null;
  message: string;
  data: T | null;
};

export const successResponse = <T>(
  data: T,
  message = "Success",
): ApiResponse<T> => ({
  error: null,
  message,
  data,
});

export const errorResponse = (
  error: ErrorPayload,
  message: string,
): ApiResponse<null> => ({
  error,
  message,
  data: null,
});
