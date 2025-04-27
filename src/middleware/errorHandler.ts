import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError";

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    // Default values
    let statusCode = 500;
    let status = "error";
    let isOperational = false;

    // If it's our custom AppError, use its properties
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        status = err.status;
        isOperational = err.isOperational;
    }

    // Different response for development and production environment
    if (process.env.NODE_ENV === "development") {
        return res.status(statusCode).json({
            status,
            error: err,
            message: err.message,
            stack: err.stack,
        });
    }

    // Production error response
    if (isOperational) {
        // Operational, trusted error: send message to client
        return res.status(statusCode).json({
            status,
            message: err.message,
        });
    }

    // Programming or other unknown error: don't leak error details
    console.error("ERROR 💥", err);
    return res.status(500).json({
        status: "error",
        message: "Something went wrong",
    });
};

export default errorHandler;
