import { NextFunction, Response } from "express";

import { UserRole } from "../enums";
import { ExtendedRequest } from "../types";
import AppError from "../utils/appError";

const validateRole = (allowedRoles: UserRole[]) => {
    return (req: ExtendedRequest, res: Response, next: NextFunction) => {
        const userRole = req.user?.role;
        const userId = req.user?.id;

        // Check if user has a role
        if (!userRole) {
            console.warn(`Authorization failed: No role found for user ${userId || "unknown"}`);
            return next(new AppError("Access denied: User role not found", 403));
        }

        // Check if user role is authorized
        if (!allowedRoles.includes(userRole)) {
            console.warn(
                `Authorization failed: User ${
                    userId || "unknown"
                } with role '${userRole}' attempted to access resource requiring roles: [${allowedRoles.join(", ")}]`
            );
            return next(new AppError(`Access denied: Insufficient permissions. Required roles: ${allowedRoles.join(", ")}`, 403));
        }

        // User is authorized, proceed
        next();
    };
};

export default validateRole;
