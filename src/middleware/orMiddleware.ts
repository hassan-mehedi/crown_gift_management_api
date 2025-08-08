import { Request, Response, NextFunction } from "express";

/**
 * Creates an OR combinator for middleware functions.
 * If the first middleware fails, it tries the second one.
 * Only fails if all middleware functions fail.
 */
const orMiddleware = (...middlewares: Array<(req: Request, res: Response, next: NextFunction) => void>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        let currentIndex = 0;
        let lastError: any = null;

        const tryNextMiddleware = (error?: any) => {
            // If there's an error, store it and try the next middleware
            if (error) {
                lastError = error;
                currentIndex++;
            }

            // If we've tried all middlewares and all failed, pass the last error
            if (currentIndex >= middlewares.length) {
                return next(lastError);
            }

            // Try the current middleware
            const currentMiddleware = middlewares[currentIndex];

            // Create a custom next function that will try the next middleware on error
            const customNext = (err?: any) => {
                if (err) {
                    // If this middleware failed, try the next one
                    tryNextMiddleware(err);
                } else {
                    // If this middleware succeeded, proceed normally
                    next();
                }
            };

            try {
                currentMiddleware(req, res, customNext);
            } catch (syncError) {
                // Handle synchronous errors
                tryNextMiddleware(syncError);
            }
        };

        // Start with the first middleware
        tryNextMiddleware();
    };
};

export default orMiddleware;
