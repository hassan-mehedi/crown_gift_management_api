import { z } from "zod";

// Schema for validating a single receiver
export const receiverSchema = z.object({
    name: z.string().optional(),
    phone: z.string().min(10, "Phone is required and should be at least 10 digits"),
    email: z.string().email("Valid email is required").optional(),
    department: z.string().optional(),
});

// Schema for creating a single receiver
export const createReceiverSchema = z.object({
    body: receiverSchema,
});

// Schema for creating multiple receivers
export const createReceiversSchema = z.object({
    body: z.array(receiverSchema),
});

// Schema for updating a receiver
export const updateReceiverSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Receiver ID is required"),
    }),
    body: receiverSchema.partial(),
});

// Schema for getting a single receiver
export const getReceiverSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Receiver ID is required"),
    }),
});

// Schema for getting a receiver by phone
export const getReceiverByPhoneSchema = z.object({
    params: z.object({
        phone: z.string().min(10, "Phone is required and should be at least 10 digits"),
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
