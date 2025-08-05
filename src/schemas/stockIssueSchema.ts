import { z } from "zod";

// Schema for validating a single stock issue
export const stockIssueSchema = z.object({
    stockItemId: z.string().min(1, "Stock item ID is required"),
    quantity: z.number().nonnegative("Quantity must be a non-negative number").default(0),
    receiverId: z.string().min(1, "Receiver ID is required"),
    status: z.string().optional(),
    comment: z.string().optional(),
    date: z
        .string()
        .or(z.date())
        .transform(val => new Date(val)),
    createdBy: z.string().optional(),
    isApproved: z.boolean().default(false),
});

// Schema for creating a single stock issue
export const createStockIssueSchema = z.object({
    body: stockIssueSchema,
});

// Schema for creating multiple stock issues
export const createStockIssuesSchema = z.object({
    body: z.array(stockIssueSchema),
});

// Schema for updating a stock issue
export const updateStockIssueSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Stock issue ID is required"),
    }),
    body: stockIssueSchema.partial(),
});

// Schema for getting a single stock issue
export const getStockIssueSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Stock issue ID is required"),
    }),
});

// Schema for getting stock issues by receiver ID
export const getStockIssuesByReceiverSchema = z.object({
    params: z.object({
        receiverId: z.string().min(1, "Receiver ID is required"),
    }),
});

// Schema for getting stock issues by stock item ID
export const getStockIssuesByStockItemSchema = z.object({
    params: z.object({
        stockItemId: z.string().min(1, "Stock item ID is required"),
    }),
});

// Schema for pagination query
export const paginationSchema = z.object({
    query: z.object({
        page: z
            .string()
            .optional()
            .transform(val => (val ? parseInt(val, 10) : 1)),
        limit: z
            .string()
            .optional()
            .transform(val => (val ? parseInt(val, 10) : 10)),
    }),
});
