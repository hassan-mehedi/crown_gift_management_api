import { z } from "zod";

// Schema for validating a single gift
export const giftSchema = z.object({
    stockItemId: z.string().min(1, "Stock item ID is required"),
    quantity: z.number().positive("Quantity must be a positive number"),
    receiverId: z.string().min(1, "Receiver ID is required"),
    date: z
        .string()
        .or(z.date())
        .transform(val => new Date(val)),
    description: z.string().optional(),
});

// Schema for creating a single gift
export const createGiftSchema = z.object({
    body: giftSchema,
});

// Schema for creating multiple gifts
export const createGiftsSchema = z.object({
    body: z.array(giftSchema),
});

// Schema for updating a gift
export const updateGiftSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Gift ID is required"),
    }),
    body: giftSchema.partial(),
});

// Schema for getting a single gift
export const getGiftSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Gift ID is required"),
    }),
});

// Schema for getting gifts by receiver ID
export const getGiftsByReceiverSchema = z.object({
    params: z.object({
        receiverId: z.string().min(1, "Receiver ID is required"),
    }),
});

// Schema for getting gifts by stock item ID
export const getGiftsByStockItemSchema = z.object({
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
