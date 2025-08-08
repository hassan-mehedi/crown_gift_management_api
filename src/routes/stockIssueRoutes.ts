import express from "express";

import {
    createStockIssue,
    deleteStockIssue,
    getAllStockIssues,
    getStockIssueById,
    getStockIssuesByReceiverId,
    getStockIssuesByStockItemId,
    updateStockIssue,
} from "../controllers/stockIssueController";
import { UserRole } from "../enums";
import authenticateJWT from "../middleware/authMiddleware";
import validateRequest from "../middleware/validateRequest";
import validateRole from "../middleware/validateRole";
import {
    createStockIssueSchema,
    getStockIssuesByReceiverSchema,
    getStockIssuesByStockItemSchema,
    getStockIssueSchema,
    paginationSchema,
    updateStockIssueSchema,
} from "../schemas/stockIssueSchema";

const router = express.Router();

// Public routes
router.get("/", validateRequest(paginationSchema), getAllStockIssues);
router.get("/:id", validateRequest(getStockIssueSchema), getStockIssueById);
router.get("/receiver/:receiverId", validateRequest(getStockIssuesByReceiverSchema), getStockIssuesByReceiverId);
router.get("/stockItem/:stockItemId", validateRequest(getStockIssuesByStockItemSchema), getStockIssuesByStockItemId);

// Protected routes (require authentication)
router.post(
    "/",
    authenticateJWT,
    validateRole([UserRole.ADMIN, UserRole.ISSUER, UserRole.APPROVER]),
    validateRequest(createStockIssueSchema),
    createStockIssue
);

router.patch(
    "/:id",
    authenticateJWT,
    validateRole([UserRole.ADMIN, UserRole.ISSUER, UserRole.APPROVER]),
    validateRequest(updateStockIssueSchema),
    updateStockIssue
);

router.delete(
    "/:id",
    authenticateJWT,
    validateRole([UserRole.ADMIN, UserRole.ISSUER, UserRole.APPROVER]),
    validateRequest(getStockIssueSchema),
    deleteStockIssue
);

export default router;
