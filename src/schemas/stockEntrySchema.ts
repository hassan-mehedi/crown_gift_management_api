import { z } from "zod";

// Schema for validating a single stock entry
export const stockEntrySchema = z.object({
    stockItemId: z.string().min(1, "Stock item ID is required"),
    quantity: z.number().nonnegative("Quantity must be a non-negative number").default(0),
    date: z
        .string()
        .or(z.date())
        .transform(val => new Date(val)),
});

// Schema for creating a single stock entry
export const createStockEntrySchema = z.object({
    body: stockEntrySchema,
});

// Schema for creating multiple stock entries
export const createStockEntriesSchema = z.object({
    body: z.array(stockEntrySchema),
});

// Schema for updating a stock entry
export const updateStockEntrySchema = z.object({
    params: z.object({
        id: z.string().min(1, "Stock entry ID is required"),
    }),
    body: stockEntrySchema.partial(),
});

// Schema for getting a single stock entry
export const getStockEntrySchema = z.object({
    params: z.object({
        id: z.string().min(1, "Stock entry ID is required"),
    }),
});

// Schema for getting stock entries by stock item ID
export const getStockEntriesByStockItemSchema = z.object({
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

// Schema for getting stock entry count by stock item ID
export const getStockEntryCountSchema = z.object({
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
