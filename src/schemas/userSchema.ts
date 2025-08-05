import { z } from "zod";
import { UserRole } from "../enums";

// Schema for validating a single user
export const userSchema = z.object({
    name: z.string().min(3, "Name is required and should be at least 3 characters"),
    email: z.string().optional(),
    department: z.string().optional(),
    phone: z.string().min(10, "Phone is required and should be at least 10 digits"),
    password: z.string().min(8, "Password is required and should be at least 8 characters"),
    designation: z.string().optional(),
    role: z.enum([UserRole.ADMIN, UserRole.RECEIVER, UserRole.USER]).default(UserRole.USER),
});

// Schema for login
export const loginUserSchema = z.object({
    body: z.object({
        phone: z.string().min(10, "Phone is required and should be at least 10 digits"),
        password: z.string().min(8, "Password is required and should be at least 8 characters"),
    }),
});

// Schema for creating a single user
export const createUserSchema = z.object({
    body: userSchema,
});

// Schema for creating multiple users
export const createUsersSchema = z.object({
    body: z.array(userSchema),
});

// Schema for updating a user
export const updateUserSchema = z.object({
    params: z.object({
        phone: z.string().min(10, "Phone is required and should be at least 10 digits"),
    }),
    body: userSchema.partial(),
});

// Schema for getting a single user
export const getUserSchema = z.object({
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
