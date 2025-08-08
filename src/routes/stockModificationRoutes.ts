import express from "express";

import {
    createStockModification,
    createStockModifications,
    deleteStockModification,
    getAllStockModifications,
    getStockModificationById,
    getStockModificationCountByStockItemId,
    getStockModificationsByStockItemId,
    updateStockModification,
} from "../controllers/stockModificationController";
import authenticateJWT from "../middleware/authMiddleware";
import validateRequest from "../middleware/validateRequest";
import validateRole from "../middleware/validateRole";
import {
    createStockModificationSchema,
    createStockModificationsSchema,
    getStockModificationCountSchema,
    getStockModificationsByStockItemSchema,
    getStockModificationSchema,
    paginationSchema,
    updateStockModificationSchema,
} from "../schemas/stockModificationSchema";
import { UserRole } from "../enums";

const router = express.Router();

/**
 * @swagger
 * /api/stock-modifications:
 *   get:
 *     summary: Get all stock modifications with pagination
 *     tags: [Stock Modifications]
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
 *         description: Stock modifications retrieved successfully
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
 *                         $ref: '#/components/schemas/StockModification'
 */
// Public routes
router.get("/", validateRequest(paginationSchema), getAllStockModifications);

/**
 * @swagger
 * /api/stock-modifications/{id}:
 *   get:
 *     summary: Get stock modification by ID
 *     tags: [Stock Modifications]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock modification ID
 *     responses:
 *       200:
 *         description: Stock modification retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/StockModification'
 *       404:
 *         description: Stock modification not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:id", validateRequest(getStockModificationSchema), getStockModificationById);

/**
 * @swagger
 * /api/stock-modifications/stock-item/{stockItemId}:
 *   get:
 *     summary: Get stock modifications by stock item ID
 *     tags: [Stock Modifications]
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
 *         description: Stock modifications retrieved successfully
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
 *                         $ref: '#/components/schemas/StockModification'
 */
// Get stock modifications by stock item ID
router.get("/stock-item/:stockItemId", validateRequest(getStockModificationsByStockItemSchema), getStockModificationsByStockItemId);

/**
 * @swagger
 * /api/stock-modifications/stock-item/{stockItemId}/count:
 *   get:
 *     summary: Get count of stock modifications for a stock item
 *     tags: [Stock Modifications]
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
 *         description: Stock modification count retrieved successfully
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
 *                         count:
 *                           type: integer
 *                           description: Number of modifications for the stock item
 */
// Get count of stock modifications for a stock item
router.get("/stock-item/:stockItemId/count", validateRequest(getStockModificationCountSchema), getStockModificationCountByStockItemId);

/**
 * @swagger
 * /api/stock-modifications:
 *   post:
 *     summary: Create stock modification(s)
 *     tags: [Stock Modifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/StockModification'
 *               - type: array
 *                 items:
 *                   $ref: '#/components/schemas/StockModification'
 *           examples:
 *             single:
 *               summary: Create single stock modification
 *               value:
 *                 stockItemId: "60f7b0b5b8f9c12a2c8b1234"
 *                 quantityChange: 5
 *                 reason: "Received new stock"
 *             multiple:
 *               summary: Create multiple stock modifications
 *               value:
 *                 - stockItemId: "60f7b0b5b8f9c12a2c8b1234"
 *                   quantityChange: 5
 *                   reason: "Received new stock"
 *                 - stockItemId: "60f7b0b5b8f9c12a2c8b5678"
 *                   quantityChange: -2
 *                   reason: "Damaged items removed"
 *     responses:
 *       201:
 *         description: Stock modification(s) created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       oneOf:
 *                         - $ref: '#/components/schemas/StockModification'
 *                         - type: array
 *                           items:
 *                             $ref: '#/components/schemas/StockModification'
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
    (req, res, next) => {
        // Determine if it's a single or multiple stock modifications based on the request body
        const validationSchema = Array.isArray(req.body) ? createStockModificationsSchema : createStockModificationSchema;
        validateRequest(validationSchema)(req, res, next);
    },
    (req, res, next) => {
        // Route to appropriate controller method
        if (Array.isArray(req.body)) {
            createStockModifications(req, res, next);
        } else {
            createStockModification(req, res, next);
        }
    }
);

/**
 * @swagger
 * /api/stock-modifications/{id}:
 *   patch:
 *     summary: Update stock modification
 *     tags: [Stock Modifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock modification ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantityChange:
 *                 type: number
 *                 description: Change in quantity (positive for addition, negative for reduction)
 *               reason:
 *                 type: string
 *                 description: Reason for the modification
 *     responses:
 *       200:
 *         description: Stock modification updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/StockModification'
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
 *         description: Stock modification not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
    "/:id",
    authenticateJWT,
    validateRole([UserRole.ADMIN, UserRole.ISSUER, UserRole.APPROVER]),
    validateRequest(updateStockModificationSchema),
    updateStockModification
);

/**
 * @swagger
 * /api/stock-modifications/{id}:
 *   delete:
 *     summary: Delete stock modification
 *     tags: [Stock Modifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock modification ID
 *     responses:
 *       200:
 *         description: Stock modification deleted successfully
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
 *         description: Stock modification not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete(
    "/:id",
    authenticateJWT,
    validateRole([UserRole.ADMIN, UserRole.ISSUER, UserRole.APPROVER]),
    validateRequest(getStockModificationSchema),
    deleteStockModification
);

export default router;
