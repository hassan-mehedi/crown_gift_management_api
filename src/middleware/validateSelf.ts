import { Response, NextFunction } from "express";
import { ExtendedRequest } from "../types";
import AppError from "../utils/appError";

const validateSelf = (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const phone = req.params.phone;
    const userPhone = req.user?.phone;

    // Check if user is authenticated (should be done by authMiddleware first)
    if (!req.user) {
        return next(new AppError("Authentication required", 401));
    }

    // Check if phone parameter exists
    if (!phone) {
        return next(new AppError("Phone parameter is required", 400));
    }

    // Check if user has phone in their token
    if (!userPhone) {
        return next(new AppError("User phone not found in authentication token", 403));
    }

    // Validate that user can only access their own resources
    if (phone !== userPhone) {
        return next(new AppError("You can only access your own resources", 403));
    }

    next();
};

export default validateSelf;
