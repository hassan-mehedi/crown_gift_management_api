import { z } from "zod";

// Schema for validating file paths for deletion
export const deleteFilesSchema = z.object({
    body: z.object({
        paths: z
            .array(z.string().min(1, "File path cannot be empty"))
            .min(1, "At least one file path is required")
            .max(20, "Cannot delete more than 20 files at once"),
    }),
});

// Schema for getting files list
export const getFilesSchema = z.object({
    query: z.object({
        folder: z.string().optional().default("uploads"),
        limit: z
            .string()
            .optional()
            .transform(val => (val ? parseInt(val, 10) : 100))
            .refine(val => val > 0 && val <= 1000, {
                message: "Limit must be between 1 and 1000",
            }),
        page: z
            .string()
            .optional()
            .transform(val => (val ? parseInt(val, 10) : 1)),
    }),
});

// Schema for getting a specific file by path
export const getFileSchema = z.object({
    params: z.object({
        path: z.string().min(1, "File path is required"),
    }),
});

// Schema for file upload metadata
export const uploadMetadataSchema = z.object({
    body: z.object({
        folder: z.string().optional().default("uploads"),
        description: z.string().optional(),
    }),
});

// Schema for file upload validation (used in middleware)
export const uploadFilesSchema = z.object({
    files: z
        .array(
            z.object({
                fieldname: z.string(),
                originalname: z.string(),
                mimetype: z
                    .string()
                    .refine(
                        type => ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"].includes(type),
                        "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."
                    ),
                size: z.number().max(20 * 1024 * 1024, "File size must be less than 20MB"),
            })
        )
        .min(1, "At least one file is required")
        .max(10, "Cannot upload more than 10 files at once"),
});
