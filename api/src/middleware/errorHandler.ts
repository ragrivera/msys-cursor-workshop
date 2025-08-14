import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  // Log error
  logger.error({
    error: {
      message: err.message,
      stack: err.stack,
      statusCode,
    },
  });

  // Don't leak error details in production
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Something went wrong!'
      : err.message;

  res.status(statusCode).json({
    status,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
    }),
  });
};
