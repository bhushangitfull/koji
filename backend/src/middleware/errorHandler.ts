import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (error instanceof AppError) {
    const response: ApiResponse<null> = {
      success: false,
      error: error.message,
    };
    res.status(error.statusCode).json(response);
    return;
  }

  if (error instanceof SyntaxError) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Invalid JSON in request body',
    };
    res.status(400).json(response);
    return;
  }

  console.error('Unhandled error:', error);

  const response: ApiResponse<null> = {
    success: false,
    error: isDevelopment ? error.message : 'Internal server error',
    message: isDevelopment ? error.stack : undefined,
  };

  res.status(500).json(response);
};

export default errorHandler;
