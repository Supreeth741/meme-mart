import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err: Error | AppError, req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof AppError) {
    logger.warn(`[ErrorHandler] AppError - Status: ${err.statusCode}, Message: "${err.message}", Path: ${req.path}, Method: ${req.method}`);
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  if (err instanceof SyntaxError) {
    logger.error(`[ErrorHandler] SyntaxError - Message: "${err.message}", Path: ${req.path}, Method: ${req.method}`);
    res.status(400).json({
      status: 'error',
      message: 'Invalid request format',
    });
    return;
  }

  logger.error(`[ErrorHandler] Unhandled error - Name: ${err.name}, Message: "${err.message}", Path: ${req.path}, Method: ${req.method}`);
  logger.error(`[ErrorHandler] Stack trace: ${err.stack}`);

  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  logger.warn(`[ErrorHandler] Route not found - Path: ${req.originalUrl}, Method: ${req.method}`);
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`,
  });
};
