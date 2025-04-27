import express from "express";
import {
    getAllGifts,
    getGiftById,
    getGiftsByReceiverId,
    getGiftsByStockItemId,
    createGift,
    updateGift,
    deleteGift,
} from "../controllers/giftController";
import validateRequest from "../middleware/validateRequest";
import authenticateJWT from "../middleware/authMiddleware";
import {
    getGiftSchema,
    getGiftsByReceiverSchema,
    getGiftsByStockItemSchema,
    createGiftSchema,
    updateGiftSchema,
    paginationSchema,
} from "../schemas/giftSchema";

const router = express.Router();

// Public routes
router.get("/", validateRequest(paginationSchema), getAllGifts);
router.get("/:id", validateRequest(getGiftSchema), getGiftById);
router.get("/receiver/:receiverId", validateRequest(getGiftsByReceiverSchema), getGiftsByReceiverId);
router.get("/stockItem/:stockItemId", validateRequest(getGiftsByStockItemSchema), getGiftsByStockItemId);

// Protected routes (require authentication)
router.post("/", authenticateJWT, validateRequest(createGiftSchema), createGift);

router.patch("/:id", authenticateJWT, validateRequest(updateGiftSchema), updateGift);

router.delete("/:id", authenticateJWT, validateRequest(getGiftSchema), deleteGift);

export default router;
