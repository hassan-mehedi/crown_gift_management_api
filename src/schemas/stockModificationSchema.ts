import { z } from "zod";

// Schema for validating a single stock modification
export const stockModificationSchema = z.object({
    stockItemId: z.string().min(1, "Stock item ID is required"),
    quantity: z.number().nonnegative("Quantity must be a non-negative number").default(0),
    date: z
        .string()
        .or(z.date())
        .transform(val => new Date(val)),
    description: z.string().optional(),
    createdBy: z.string().optional(),
    isApproved: z.boolean().default(false),
});

// Schema for creating a single stock modification
export const createStockModificationSchema = z.object({
    body: stockModificationSchema,
});

// Schema for creating multiple stock modifications
export const createStockModificationsSchema = z.object({
    body: z.array(stockModificationSchema),
});

// Schema for updating a stock modification
export const updateStockModificationSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Stock modification ID is required"),
    }),
    body: stockModificationSchema.partial(),
});

// Schema for getting a single stock modification
export const getStockModificationSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Stock modification ID is required"),
    }),
});

// Schema for getting stock modifications by stock item ID
export const getStockModificationsByStockItemSchema = z.object({
    params: z.object({
        stockItemId: z.string().min(1, "Stock item ID is required"),
    }),
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

// Schema for getting stock modification count by stock item ID
export const getStockModificationCountSchema = z.object({
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
