import express from "express";

import {
    createStockItem,
    createStockItems,
    deleteStockItem,
    getAllStockItems,
    getStockItemById,
    updateStockItem,
} from "../controllers/stockItemController";
import authenticateJWT from "../middleware/authMiddleware";
import validateRequest from "../middleware/validateRequest";
import validateRole from "../middleware/validateRole";
import {
    createStockItemSchema,
    createStockItemsSchema,
    getStockItemSchema,
    paginationSchema,
    updateStockItemSchema,
} from "../schemas/stockItemSchema";
import { UserRole } from "../enums";

const router = express.Router();

// Public routes
router.get("/", validateRequest(paginationSchema), getAllStockItems);
router.get("/:id", validateRequest(getStockItemSchema), getStockItemById);

// Protected routes (require authentication)
router.post(
    "/",
    authenticateJWT,
    validateRole([UserRole.ADMIN, UserRole.ISSUER, UserRole.APPROVER]),
    (req, res, next) => {
        // Determine if it's a single or multiple stock items based on the request body
        const validationSchema = Array.isArray(req.body) ? createStockItemsSchema : createStockItemSchema;
        validateRequest(validationSchema)(req, res, next);
    },
    (req, res, next) => {
        // Route to appropriate controller method
        if (Array.isArray(req.body)) {
            createStockItems(req, res, next);
        } else {
            createStockItem(req, res, next);
        }
    }
);

router.patch(
    "/:id",
    authenticateJWT,
    validateRole([UserRole.ADMIN, UserRole.ISSUER, UserRole.APPROVER]),
    validateRequest(updateStockItemSchema),
    updateStockItem
);

router.delete(
    "/:id",
    authenticateJWT,
    validateRole([UserRole.ADMIN, UserRole.ISSUER, UserRole.APPROVER]),
    validateRequest(getStockItemSchema),
    deleteStockItem
);

export default router;
