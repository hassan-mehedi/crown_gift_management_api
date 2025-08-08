import express from "express";

import { deleteFiles, getFileByPath, getFiles, uploadImages } from "../controllers/imageUploadController";
import authenticateJWT from "../middleware/authMiddleware";
import { upload } from "../middleware/imageUploadHandler";
import validateRequest from "../middleware/validateRequest";
import { deleteFilesSchema, getFileSchema, getFilesSchema } from "../schemas/imageUploadSchema";
import validateRole from "../middleware/validateRole";
import { UserRole } from "../enums";

const router = express.Router();

/**
 * @swagger
 * /api/image-upload:
 *   get:
 *     summary: Get list of uploaded files (Admin only)
 *     tags: [Image Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: folder
 *         schema:
 *           type: string
 *         description: Folder path to list files from
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Maximum number of files to return
 *     responses:
 *       200:
 *         description: Files retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             description: File name
 *                           publicUrl:
 *                             type: string
 *                             description: Public URL to access the file
 *                           size:
 *                             type: number
 *                             description: File size in bytes
 *                           lastModified:
 *                             type: string
 *                             format: date-time
 *                             description: Last modified date
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Protected routes (require authentication)
router.get("/", authenticateJWT, validateRole([UserRole.ADMIN]), validateRequest(getFilesSchema), getFiles);

/**
 * @swagger
 * /api/image-upload/{path}:
 *   get:
 *     summary: Get file by path
 *     tags: [Image Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         description: File path in storage
 *     responses:
 *       200:
 *         description: File retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           description: File name
 *                         publicUrl:
 *                           type: string
 *                           description: Public URL to access the file
 *                         size:
 *                           type: number
 *                           description: File size in bytes
 *                         contentType:
 *                           type: string
 *                           description: MIME type of the file
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: File not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:path", authenticateJWT, validateRequest(getFileSchema), getFileByPath);

/**
 * @swagger
 * /api/image-upload/upload:
 *   post:
 *     summary: Upload images
 *     tags: [Image Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Images to upload (max 10 files)
 *                 maxItems: 10
 *     responses:
 *       201:
 *         description: Images uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           originalName:
 *                             type: string
 *                             description: Original file name
 *                           fileName:
 *                             type: string
 *                             description: Stored file name
 *                           publicUrl:
 *                             type: string
 *                             description: Public URL to access the uploaded file
 *                           size:
 *                             type: number
 *                             description: File size in bytes
 *       400:
 *         description: Invalid file type or size
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/upload", authenticateJWT, upload.array("images", 10), uploadImages);

/**
 * @swagger
 * /api/image-upload:
 *   delete:
 *     summary: Delete files (Admin only)
 *     tags: [Image Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [paths]
 *             properties:
 *               paths:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of file paths to delete
 *     responses:
 *       200:
 *         description: Files deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         deletedCount:
 *                           type: integer
 *                           description: Number of files successfully deleted
 *                         errors:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               path:
 *                                 type: string
 *                               error:
 *                                 type: string
 *                           description: Any errors encountered during deletion
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/", authenticateJWT, validateRole([UserRole.ADMIN]), validateRequest(deleteFilesSchema), deleteFiles);

export default router;
