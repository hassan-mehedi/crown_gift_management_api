import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";

const validateRequest = (schema: AnyZodObject) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            return next();
        } catch (error: any) {
            const errorMessage = error.errors?.map((err: any) => err.message).join(", ") ?? "Validation failed";
            return res.status(400).json({
                status: "error",
                message: errorMessage,
            });
        }
    };
};

export default validateRequest;
