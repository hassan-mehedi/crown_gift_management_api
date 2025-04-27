import { Response, NextFunction } from "express";
import { ExtendedRequest } from "../types";
import jwt, { JwtPayload } from "jsonwebtoken";
import env from "../config/env";

const authenticateJWT = (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            status: "error",
            message: "Authentication token is required",
        });
    }

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        req.user = decoded as JwtPayload;
        req.isAuthenticated = true;
        next();
    } catch (error: any) {
        return res.status(403).json({
            status: "error",
            message: error.message ?? "Invalid or expired token",
        });
    }
};

export default authenticateJWT;
