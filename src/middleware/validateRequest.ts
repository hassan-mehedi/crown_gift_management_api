import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";

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
            if (error instanceof ZodError) {
                const validationErrors = error.errors.map(err => {
                    const fieldPath = err.path.join(".");
                    const fieldName = err.path.length > 1 ? `${err.path[0]}.${err.path.slice(1).join(".")}` : err.path[0];

                    // Create more user-friendly error messages based on error codes
                    let userMessage = err.message;

                    switch (err.code) {
                        case "invalid_type":
                            userMessage = `Field '${fieldName}' expected ${err.expected} but received ${err.received}`;
                            break;
                        case "too_small":
                            if (err.type === "string") {
                                userMessage = `Field '${fieldName}' must be at least ${err.minimum} characters long`;
                            } else if (err.type === "number") {
                                userMessage = `Field '${fieldName}' must be at least ${err.minimum}`;
                            } else if (err.type === "array") {
                                userMessage = `Field '${fieldName}' must contain at least ${err.minimum} item(s)`;
                            }
                            break;
                        case "too_big":
                            if (err.type === "string") {
                                userMessage = `Field '${fieldName}' must be at most ${err.maximum} characters long`;
                            } else if (err.type === "number") {
                                userMessage = `Field '${fieldName}' must be at most ${err.maximum}`;
                            } else if (err.type === "array") {
                                userMessage = `Field '${fieldName}' must contain at most ${err.maximum} item(s)`;
                            }
                            break;
                        case "invalid_string":
                            if (err.validation === "email") {
                                userMessage = `Field '${fieldName}' must be a valid email address`;
                            } else if (err.validation === "url") {
                                userMessage = `Field '${fieldName}' must be a valid URL`;
                            } else if (err.validation === "uuid") {
                                userMessage = `Field '${fieldName}' must be a valid UUID`;
                            } else {
                                userMessage = `Field '${fieldName}' format is invalid`;
                            }
                            break;
                        case "invalid_enum_value":
                            userMessage = `Field '${fieldName}' must be one of: ${err.options?.join(", ")}`;
                            break;
                        case "unrecognized_keys":
                            userMessage = `Unexpected field(s): ${err.keys?.join(", ")}`;
                            break;
                        case "invalid_date":
                            userMessage = `Field '${fieldName}' must be a valid date`;
                            break;
                        default:
                            userMessage = `Field '${fieldName}': ${err.message}`;
                    }

                    return {
                        field: fieldName,
                        message: userMessage,
                        code: err.code,
                        path: fieldPath,
                    };
                });

                return res.status(400).json({
                    status: "error",
                    message: "Validation failed",
                    errors: validationErrors,
                    details: {
                        summary: `${validationErrors.length} validation error(s) found`,
                        fields: validationErrors.map(err => err.field),
                    },
                });
            }

            // Fallback for non-Zod errors
            return res.status(400).json({
                status: "error",
                message: "Validation failed",
                error: error.message ?? "Unknown validation error",
            });
        }
    };
};

export default validateRequest;
