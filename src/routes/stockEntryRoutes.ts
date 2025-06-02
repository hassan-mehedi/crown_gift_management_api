import express from "express";
import {
    getAllStockEntries,
    getStockEntryById,
    createStockEntry,
    createStockEntries,
    updateStockEntry,
    deleteStockEntry,
    getStockEntriesByStockItemId,
    getStockEntryCountByStockItemId,
} from "../controllers/stockEntryController";
import validateRequest from "../middleware/validateRequest";
import authenticateJWT from "../middleware/authMiddleware";
import {
    getStockEntrySchema,
    createStockEntrySchema,
    createStockEntriesSchema,
    updateStockEntrySchema,
    paginationSchema,
    getStockEntriesByStockItemSchema,
    getStockEntryCountSchema,
} from "../schemas/stockEntrySchema";

const router = express.Router();

// Public routes
router.get("/", validateRequest(paginationSchema), getAllStockEntries);
router.get("/:id", validateRequest(getStockEntrySchema), getStockEntryById);

// Get stock entries by stock item ID
router.get("/stock-item/:stockItemId", validateRequest(getStockEntriesByStockItemSchema), getStockEntriesByStockItemId);

// Get count of stock entries for a stock item
router.get("/stock-item/:stockItemId/count", validateRequest(getStockEntryCountSchema), getStockEntryCountByStockItemId);

// Protected routes (require authentication)
router.post(
    "/",
    authenticateJWT,
    (req, res, next) => {
        // Determine if it's a single or multiple stock entries based on the request body
        const validationSchema = Array.isArray(req.body) ? createStockEntriesSchema : createStockEntrySchema;
        validateRequest(validationSchema)(req, res, next);
    },
    (req, res, next) => {
        // Route to appropriate controller method
        if (Array.isArray(req.body)) {
            createStockEntries(req, res, next);
        } else {
            createStockEntry(req, res, next);
        }
    }
);

router.patch("/:id", authenticateJWT, validateRequest(updateStockEntrySchema), updateStockEntry);

router.delete("/:id", authenticateJWT, validateRequest(getStockEntrySchema), deleteStockEntry);

export default router;
