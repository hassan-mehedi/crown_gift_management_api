import { z } from "zod";

// Schema for validating a single vendor
export const vendorSchema = z.object({
    name: z.string().min(3, "Name is required and should be at least 3 characters"),
    email: z.string().email("Please provide a valid email").optional(),
    phone: z.string().min(10, "Phone is required and should be at least 10 digits"),
});

// Schema for creating a single vendor
export const createVendorSchema = z.object({
    body: vendorSchema,
});

// Schema for creating multiple vendors
export const createVendorsSchema = z.object({
    body: z.array(vendorSchema),
});

// Schema for updating a vendor by phone
export const updateVendorByPhoneSchema = z.object({
    params: z.object({
        phone: z.string().min(10, "Phone is required and should be at least 10 digits"),
    }),
    body: vendorSchema.partial(),
});

// Schema for updating a vendor by ID
export const updateVendorByIdSchema = z.object({
    params: z.object({
        id: z.string().min(1, "ID is required"),
    }),
    body: vendorSchema.partial(),
});

// Schema for getting a single vendor by phone
export const getVendorByPhoneSchema = z.object({
    params: z.object({
        phone: z.string().min(10, "Phone is required and should be at least 10 digits"),
    }),
});

// Schema for getting a single vendor by ID
export const getVendorByIdSchema = z.object({
    params: z.object({
        id: z.string().min(1, "ID is required"),
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
