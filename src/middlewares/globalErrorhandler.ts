import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
    statusCode?: number;
}

const errorMiddleware = (
    error: CustomError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    error.statusCode = error.statusCode || 500;
    error.message = error.message || "Internal Server Error";

    res.status(error.statusCode).json({
        success: false,
        message: error.message,
    });
};

export default errorMiddleware;
