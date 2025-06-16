import express from "express";
import {
    getAllStockIssues,
    getStockIssueById,
    getStockIssuesByReceiverId,
    getStockIssuesByStockItemId,
    createStockIssue,
    updateStockIssue,
    deleteStockIssue,
} from "../controllers/stockIssueController";
import validateRequest from "../middleware/validateRequest";
import authenticateJWT from "../middleware/authMiddleware";
import {
    getStockIssueSchema,
    getStockIssuesByReceiverSchema,
    getStockIssuesByStockItemSchema,
    createStockIssueSchema,
    updateStockIssueSchema,
    paginationSchema,
} from "../schemas/stockIssueSchema";

const router = express.Router();

// Public routes
router.get("/", validateRequest(paginationSchema), getAllStockIssues);
router.get("/:id", validateRequest(getStockIssueSchema), getStockIssueById);
router.get("/receiver/:receiverId", validateRequest(getStockIssuesByReceiverSchema), getStockIssuesByReceiverId);
router.get("/stockItem/:stockItemId", validateRequest(getStockIssuesByStockItemSchema), getStockIssuesByStockItemId);

// Protected routes (require authentication)
router.post("/", authenticateJWT, validateRequest(createStockIssueSchema), createStockIssue);

router.patch("/:id", authenticateJWT, validateRequest(updateStockIssueSchema), updateStockIssue);

router.delete("/:id", authenticateJWT, validateRequest(getStockIssueSchema), deleteStockIssue);

export default router;
