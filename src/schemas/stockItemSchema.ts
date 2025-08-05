import { z } from "zod";

// Schema for validating a single stock item
export const stockItemSchema = z.object({
    name: z.string().min(1, "Name is required"),
    quantity: z.number().nonnegative("Quantity must be a non-negative number").default(0),
    storage: z.string().optional(),
    unitCost: z.number().nonnegative("Unit cost must be a non-negative number").default(0),
    picture: z.string().optional(),
    vendorId: z.string().min(1, "Vendor ID is required"),
    workOrderNumber: z.string().optional(),
    date: z
        .string()
        .or(z.date())
        .transform(val => new Date(val)),
    description: z.string().optional(),
    createdBy: z.string().min(1, "Creator ID is required"),
    isApproved: z.boolean().default(false),
});

// Schema for creating a single stock item
export const createStockItemSchema = z.object({
    body: stockItemSchema,
});

// Schema for creating multiple stock items
export const createStockItemsSchema = z.object({
    body: z.array(stockItemSchema),
});

// Schema for updating a stock item
export const updateStockItemSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Stock item ID is required"),
    }),
    body: stockItemSchema.partial(),
});

// Schema for getting a single stock item
export const getStockItemSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Stock item ID is required"),
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
