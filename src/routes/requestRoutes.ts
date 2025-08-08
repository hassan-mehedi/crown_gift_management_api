import { Router } from "express";

import { getAllRequests, getRequestById, updateRequest } from "../controllers/requestController";
import { UserRole } from "../enums";
import authMiddleware from "../middleware/authMiddleware";
import validateRole from "../middleware/validateRole";
import validateRequest from "../middleware/validateRequest";
import { getAllRequestsSchema, getRequestSchema, updateRequestSchema } from "../schemas/requestSchema";

const router = Router();

// Get all requests with optional status filter
router.get(
    "/",
    authMiddleware,
    validateRole([UserRole.ADMIN, UserRole.ISSUER, UserRole.APPROVER]),
    validateRequest(getAllRequestsSchema),
    getAllRequests
);

// Get a single request by ID
router.get(
    "/:id",
    authMiddleware,
    validateRole([UserRole.ADMIN, UserRole.ISSUER, UserRole.APPROVER]),
    validateRequest(getRequestSchema),
    getRequestById
);

// Update a request (status and comment only, Admin role required)
router.put("/:id", authMiddleware, validateRole([UserRole.ADMIN, UserRole.APPROVER]), validateRequest(updateRequestSchema), updateRequest);

export default router;
