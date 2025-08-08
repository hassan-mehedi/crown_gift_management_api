import express from "express";

import {
    createStockItem,
    createStockItems,
    deleteStockItem,
    getAllStockItems,
    getStockItemById,
    updateStockItem,
} from "../controllers/stockItemController";
import authenticateJWT from "../middleware/authMiddleware";
import validateRequest from "../middleware/validateRequest";
import validateRole from "../middleware/validateRole";
import {
    createStockItemSchema,
    createStockItemsSchema,
    getStockItemSchema,
    paginationSchema,
    updateStockItemSchema,
} from "../schemas/stockItemSchema";
import { UserRole } from "../enums";

const router = express.Router();

/**
 * @swagger
 * /api/stock-items:
 *   get:
 *     summary: Get all stock items with pagination
 *     tags: [Stock Items]
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
 *         description: Stock items retrieved successfully
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
 *                         $ref: '#/components/schemas/StockItem'
 */
// Public routes
router.get("/", validateRequest(paginationSchema), getAllStockItems);

/**
 * @swagger
 * /api/stock-items/{id}:
 *   get:
 *     summary: Get stock item by ID
 *     tags: [Stock Items]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock item ID
 *     responses:
 *       200:
 *         description: Stock item retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/StockItem'
 *       404:
 *         description: Stock item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:id", validateRequest(getStockItemSchema), getStockItemById);

/**
 * @swagger
 * /api/stock-items:
 *   post:
 *     summary: Create stock item(s)
 *     tags: [Stock Items]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/StockItem'
 *               - type: array
 *                 items:
 *                   $ref: '#/components/schemas/StockItem'
 *           examples:
 *             single:
 *               summary: Create single stock item
 *               value:
 *                 name: "Laptop"
 *                 description: "Dell Laptop 15 inch"
 *                 quantity: 10
 *                 category: "Electronics"
 *                 unit: "piece"
 *             multiple:
 *               summary: Create multiple stock items
 *               value:
 *                 - name: "Laptop"
 *                   description: "Dell Laptop 15 inch"
 *                   quantity: 10
 *                   category: "Electronics"
 *                   unit: "piece"
 *                 - name: "Mouse"
 *                   description: "Wireless Mouse"
 *                   quantity: 25
 *                   category: "Electronics"
 *                   unit: "piece"
 *     responses:
 *       201:
 *         description: Stock item(s) created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       oneOf:
 *                         - $ref: '#/components/schemas/StockItem'
 *                         - type: array
 *                           items:
 *                             $ref: '#/components/schemas/StockItem'
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
        // Determine if it's a single or multiple stock items based on the request body
        const validationSchema = Array.isArray(req.body) ? createStockItemsSchema : createStockItemSchema;
        validateRequest(validationSchema)(req, res, next);
    },
    (req, res, next) => {
        // Route to appropriate controller method
        if (Array.isArray(req.body)) {
            createStockItems(req, res, next);
        } else {
            createStockItem(req, res, next);
        }
    }
);

/**
 * @swagger
 * /api/stock-items/{id}:
 *   patch:
 *     summary: Update stock item
 *     tags: [Stock Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               quantity:
 *                 type: number
 *                 minimum: 0
 *               category:
 *                 type: string
 *               unit:
 *                 type: string
 *     responses:
 *       200:
 *         description: Stock item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/StockItem'
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
 *         description: Stock item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
    "/:id",
    authenticateJWT,
    validateRole([UserRole.ADMIN, UserRole.ISSUER, UserRole.APPROVER]),
    validateRequest(updateStockItemSchema),
    updateStockItem
);

/**
 * @swagger
 * /api/stock-items/{id}:
 *   delete:
 *     summary: Delete stock item
 *     tags: [Stock Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock item ID
 *     responses:
 *       200:
 *         description: Stock item deleted successfully
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
 *         description: Stock item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete(
    "/:id",
    authenticateJWT,
    validateRole([UserRole.ADMIN, UserRole.ISSUER, UserRole.APPROVER]),
    validateRequest(getStockItemSchema),
    deleteStockItem
);

export default router;
