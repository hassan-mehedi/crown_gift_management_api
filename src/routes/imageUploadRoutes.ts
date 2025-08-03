import express from "express";

import { deleteFiles, getFileByPath, getFiles, uploadImages } from "../controllers/imageUploadController";
import authenticateJWT from "../middleware/authMiddleware";
import { upload } from "../middleware/imageUploadHandler";
import validateRequest from "../middleware/validateRequest";
import { deleteFilesSchema, getFileSchema, getFilesSchema } from "../schemas/imageUploadSchema";

const router = express.Router();

// Protected routes (require authentication)
router.get("/", authenticateJWT, validateRequest(getFilesSchema), getFiles);
router.get("/:path", authenticateJWT, validateRequest(getFileSchema), getFileByPath);
router.post("/upload", authenticateJWT, upload.array("images", 10), uploadImages);
router.delete("/", authenticateJWT, validateRequest(deleteFilesSchema), deleteFiles);

export default router;
