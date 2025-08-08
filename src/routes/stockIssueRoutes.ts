import express from "express";

import {
    createStockIssue,
    deleteStockIssue,
    getAllStockIssues,
    getStockIssueById,
    getStockIssuesByReceiverId,
    getStockIssuesByStockItemId,
    updateStockIssue,
} from "../controllers/stockIssueController";
import { UserRole } from "../enums";
import authenticateJWT from "../middleware/authMiddleware";
import validateRequest from "../middleware/validateRequest";
import validateRole from "../middleware/validateRole";
import {
    createStockIssueSchema,
    getStockIssuesByReceiverSchema,
    getStockIssuesByStockItemSchema,
    getStockIssueSchema,
    paginationSchema,
    updateStockIssueSchema,
} from "../schemas/stockIssueSchema";

const router = express.Router();

/**
 * @swagger
 * /api/stock-issues:
 *   get:
 *     summary: Get all stock issues with pagination
 *     tags: [Stock Issues]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Stock issues retrieved successfully
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
 *                         $ref: '#/components/schemas/StockIssue'
 */
// Public routes
router.get("/", validateRequest(paginationSchema), getAllStockIssues);

/**
 * @swagger
 * /api/stock-issues/{id}:
 *   get:
 *     summary: Get stock issue by ID
 *     tags: [Stock Issues]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock issue ID
 *     responses:
 *       200:
 *         description: Stock issue retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/StockIssue'
 *       404:
 *         description: Stock issue not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:id", validateRequest(getStockIssueSchema), getStockIssueById);

/**
 * @swagger
 * /api/stock-issues/receiver/{receiverId}:
 *   get:
 *     summary: Get stock issues by receiver ID
 *     tags: [Stock Issues]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: receiverId
 *         required: true
 *         schema:
 *           type: string
 *         description: Receiver user ID
 *     responses:
 *       200:
 *         description: Stock issues retrieved successfully
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
 *                         $ref: '#/components/schemas/StockIssue'
 */
router.get("/receiver/:receiverId", validateRequest(getStockIssuesByReceiverSchema), getStockIssuesByReceiverId);

/**
 * @swagger
 * /api/stock-issues/stockItem/{stockItemId}:
 *   get:
 *     summary: Get stock issues by stock item ID
 *     tags: [Stock Issues]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: stockItemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock item ID
 *     responses:
 *       200:
 *         description: Stock issues retrieved successfully
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
 *                         $ref: '#/components/schemas/StockIssue'
 */
router.get("/stockItem/:stockItemId", validateRequest(getStockIssuesByStockItemSchema), getStockIssuesByStockItemId);

/**
 * @swagger
 * /api/stock-issues:
 *   post:
 *     summary: Create a new stock issue
 *     tags: [Stock Issues]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [stockItemId, receiverId, quantity]
 *             properties:
 *               stockItemId:
 *                 type: string
 *                 description: ID of the stock item to issue
 *               receiverId:
 *                 type: string
 *                 description: ID of the user receiving the stock
 *               quantity:
 *                 type: number
 *                 minimum: 1
 *                 description: Quantity to issue
 *               notes:
 *                 type: string
 *                 description: Additional notes for the issue
 *     responses:
 *       201:
 *         description: Stock issue created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/StockIssue'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin, Issuer, or Approver role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Protected routes (require authentication)
router.post(
    "/",
    authenticateJWT,
    validateRole([UserRole.ADMIN, UserRole.ISSUER, UserRole.APPROVER]),
    validateRequest(createStockIssueSchema),
    createStockIssue
);

/**
 * @swagger
 * /api/stock-issues/{id}:
 *   patch:
 *     summary: Update stock issue
 *     tags: [Stock Issues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock issue ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *                 minimum: 1
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Stock issue updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/StockIssue'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin, Issuer, or Approver role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Stock issue not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
    "/:id",
    authenticateJWT,
    validateRole([UserRole.ADMIN, UserRole.ISSUER, UserRole.APPROVER]),
    validateRequest(updateStockIssueSchema),
    updateStockIssue
);

/**
 * @swagger
 * /api/stock-issues/{id}:
 *   delete:
 *     summary: Delete stock issue
 *     tags: [Stock Issues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock issue ID
 *     responses:
 *       200:
 *         description: Stock issue deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin, Issuer, or Approver role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Stock issue not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete(
    "/:id",
    authenticateJWT,
    validateRole([UserRole.ADMIN, UserRole.ISSUER, UserRole.APPROVER]),
    validateRequest(getStockIssueSchema),
    deleteStockIssue
);

export default router;
