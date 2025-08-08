import express from "express";

import { deleteUser, getAllUsers, getUserByPhone, loginUser, registerUser, updateUser, updateUserRole } from "../controllers/userController";
import { UserRole } from "../enums";
import authenticateJWT from "../middleware/authMiddleware";
import orMiddleware from "../middleware/orMiddleware";
import validateRequest from "../middleware/validateRequest";
import validateRole from "../middleware/validateRole";
import validateSelf from "../middleware/validateSelf";
import { createUserSchema, getUserSchema, loginUserSchema, paginationSchema, updateUserSchema } from "../schemas/userSchema";

const router = express.Router();

// Auth routes (public)
router.post("/register", validateRequest(createUserSchema), registerUser);
router.post("/login", validateRequest(loginUserSchema), loginUser);

// Public routes
router.get("/", validateRequest(paginationSchema), getAllUsers);
router.get("/:phone", validateRequest(getUserSchema), getUserByPhone);

// Protected routes
router.patch("/role/:phone", authenticateJWT, validateRole([UserRole.ADMIN]), validateRequest(updateUserSchema), updateUserRole);
router.patch("/:phone", authenticateJWT, validateSelf, validateRequest(updateUserSchema), updateUser);
router.delete("/:phone", authenticateJWT, orMiddleware(validateRole([UserRole.ADMIN]), validateSelf), validateRequest(getUserSchema), deleteUser);

export default router;
