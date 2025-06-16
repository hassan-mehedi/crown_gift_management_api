import express from "express";
import {
    getAllStockModifications,
    getStockModificationById,
    createStockModification,
    createStockModifications,
    updateStockModification,
    deleteStockModification,
    getStockModificationsByStockItemId,
    getStockModificationCountByStockItemId,
} from "../controllers/stockModificationController";
import validateRequest from "../middleware/validateRequest";
import authenticateJWT from "../middleware/authMiddleware";
import {
    getStockModificationSchema,
    createStockModificationSchema,
    createStockModificationsSchema,
    updateStockModificationSchema,
    paginationSchema,
    getStockModificationsByStockItemSchema,
    getStockModificationCountSchema,
} from "../schemas/stockModificationSchema";

const router = express.Router();

// Public routes
router.get("/", validateRequest(paginationSchema), getAllStockModifications);
router.get("/:id", validateRequest(getStockModificationSchema), getStockModificationById);

// Get stock modifications by stock item ID
router.get("/stock-item/:stockItemId", validateRequest(getStockModificationsByStockItemSchema), getStockModificationsByStockItemId);

// Get count of stock modifications for a stock item
router.get("/stock-item/:stockItemId/count", validateRequest(getStockModificationCountSchema), getStockModificationCountByStockItemId);

// Protected routes (require authentication)
router.post(
    "/",
    authenticateJWT,
    (req, res, next) => {
        // Determine if it's a single or multiple stock modifications based on the request body
        const validationSchema = Array.isArray(req.body) ? createStockModificationsSchema : createStockModificationSchema;
        validateRequest(validationSchema)(req, res, next);
    },
    (req, res, next) => {
        // Route to appropriate controller method
        if (Array.isArray(req.body)) {
            createStockModifications(req, res, next);
        } else {
            createStockModification(req, res, next);
        }
    }
);

router.patch("/:id", authenticateJWT, validateRequest(updateStockModificationSchema), updateStockModification);

router.delete("/:id", authenticateJWT, validateRequest(getStockModificationSchema), deleteStockModification);

export default router;
