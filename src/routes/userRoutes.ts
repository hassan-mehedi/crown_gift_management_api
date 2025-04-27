import express from "express";
import { registerUser, loginUser, getAllUsers, getUserByPhone, updateUser, deleteUser } from "../controllers/userController";
import validateRequest from "../middleware/validateRequest";
import authenticateJWT from "../middleware/authMiddleware";
import { createUserSchema, loginUserSchema, getUserSchema, updateUserSchema, paginationSchema } from "../schemas/userSchema";

const router = express.Router();

// Auth routes (public)
router.post("/register", validateRequest(createUserSchema), registerUser);
router.post("/login", validateRequest(loginUserSchema), loginUser);

// Public routes
router.get("/", validateRequest(paginationSchema), getAllUsers);
router.get("/:phone", validateRequest(getUserSchema), getUserByPhone);

// Protected routes
router.patch("/:phone", authenticateJWT, validateRequest(updateUserSchema), updateUser);
router.delete("/:phone", authenticateJWT, validateRequest(getUserSchema), deleteUser);

export default router;
