import express from "express";

import { deleteFiles, getFileByPath, getFiles, uploadImages } from "../controllers/imageUploadController";
import authenticateJWT from "../middleware/authMiddleware";
import { upload } from "../middleware/imageUploadHandler";
import validateRequest from "../middleware/validateRequest";
import { deleteFilesSchema, getFileSchema, getFilesSchema } from "../schemas/imageUploadSchema";
import validateRole from "../middleware/validateRole";
import { UserRole } from "../enums";

const router = express.Router();

// Protected routes (require authentication)
router.get("/", authenticateJWT, validateRole([UserRole.ADMIN]), validateRequest(getFilesSchema), getFiles);
router.get("/:path", authenticateJWT, validateRequest(getFileSchema), getFileByPath);
router.post("/upload", authenticateJWT, upload.array("images", 10), uploadImages);
router.delete("/", authenticateJWT, validateRole([UserRole.ADMIN]), validateRequest(deleteFilesSchema), deleteFiles);

export default router;
