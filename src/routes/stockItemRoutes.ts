import express from "express";
import {
    getAllStockItems,
    getStockItemById,
    createStockItem,
    createStockItems,
    updateStockItem,
    deleteStockItem,
} from "../controllers/stockItemController";
import validateRequest from "../middleware/validateRequest";
import authenticateJWT from "../middleware/authMiddleware";
import {
    getStockItemSchema,
    createStockItemSchema,
    createStockItemsSchema,
    updateStockItemSchema,
    paginationSchema,
} from "../schemas/stockItemSchema";

const router = express.Router();

// Public routes
router.get("/", validateRequest(paginationSchema), getAllStockItems);
router.get("/:id", validateRequest(getStockItemSchema), getStockItemById);

// Protected routes (require authentication)
router.post(
    "/",
    authenticateJWT,
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

router.patch("/:id", authenticateJWT, validateRequest(updateStockItemSchema), updateStockItem);

router.delete("/:id", authenticateJWT, validateRequest(getStockItemSchema), deleteStockItem);

export default router;
