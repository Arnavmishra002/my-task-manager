import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    const status = err.status || 'error';

    // Simple error logging
    if (statusCode === 500) {
        console.error('🔥 Server Error:', err);
    }

    res.status(statusCode).json({
        status,
        message: err.message,
    });
};
