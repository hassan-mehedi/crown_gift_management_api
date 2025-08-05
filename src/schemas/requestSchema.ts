import { z } from "zod";
import { ApprovalStatus } from "../enums";

// Schema for validating a single request
export const requestSchema = z.object({
    stockItemId: z.string().optional(),
    stockIssueId: z.string().optional(),
    stockModificationId: z.string().optional(),
    status: z
        .enum([ApprovalStatus.PENDING, ApprovalStatus.CHANGE_REQUESTED, ApprovalStatus.APPROVED, ApprovalStatus.REJECTED])
        .default(ApprovalStatus.PENDING),
    comment: z.string().optional().default(""),
    createdBy: z.string().min(1, "Creator ID is required"),
    approvedBy: z.string().optional(),
    rejectedBy: z.string().optional(),
});

// Schema for creating a single request
export const createRequestSchema = z.object({
    body: requestSchema,
});

// Schema for creating multiple requests
export const createRequestsSchema = z.object({
    body: z.array(requestSchema),
});

// Schema for updating a request (only status and comment allowed)
export const updateRequestSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Request ID is required"),
    }),
    body: z.object({
        status: z.enum([ApprovalStatus.PENDING, ApprovalStatus.CHANGE_REQUESTED, ApprovalStatus.APPROVED, ApprovalStatus.REJECTED]).optional(),
        comment: z.string().optional(),
    }),
});

// Schema for getting a single request
export const getRequestSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Request ID is required"),
    }),
});

// Schema for getting requests by stock item ID
export const getRequestsByStockItemSchema = z.object({
    params: z.object({
        stockItemId: z.string().min(1, "Stock item ID is required"),
    }),
});

// Schema for getting requests by stock issue ID
export const getRequestsByStockIssueSchema = z.object({
    params: z.object({
        stockIssueId: z.string().min(1, "Stock issue ID is required"),
    }),
});

// Schema for getting requests by stock modification ID
export const getRequestsByStockModificationSchema = z.object({
    params: z.object({
        stockModificationId: z.string().min(1, "Stock modification ID is required"),
    }),
});

// Schema for getting all requests with optional status filter and pagination
export const getAllRequestsSchema = z.object({
    query: z
        .object({
            status: z.enum([ApprovalStatus.PENDING, ApprovalStatus.CHANGE_REQUESTED, ApprovalStatus.APPROVED, ApprovalStatus.REJECTED]).optional(),
            page: z
                .string()
                .optional()
                .transform(val => (val ? parseInt(val, 10) : 1)),
            limit: z
                .string()
                .optional()
                .transform(val => (val ? parseInt(val, 10) : 100)),
        })
        .optional(),
});

// Schema for pagination query (reuse from stockIssueSchema if needed)
export { paginationSchema } from "./stockIssueSchema";
