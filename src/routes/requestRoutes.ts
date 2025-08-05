import { Router } from "express";

import { getAllRequests, getRequestById, updateRequest } from "../controllers/requestController";
import authMiddleware from "../middleware/authMiddleware";
import validateRequest from "../middleware/validateRequest";
import { getAllRequestsSchema, getRequestSchema, updateRequestSchema } from "../schemas/requestSchema";

const router = Router();

// Get all requests with optional status filter
router.get("/", authMiddleware, validateRequest(getAllRequestsSchema), getAllRequests);

// Get a single request by ID
router.get("/:id", authMiddleware, validateRequest(getRequestSchema), getRequestById);

// Update a request (status and comment only, Admin role required)
router.put("/:id", authMiddleware, validateRequest(updateRequestSchema), updateRequest);

export default router;
