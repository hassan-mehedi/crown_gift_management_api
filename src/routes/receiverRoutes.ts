import express from "express";
import {
    getAllReceivers,
    getReceiverById,
    getReceiverByPhone,
    createReceiver,
    createReceivers,
    updateReceiver,
    deleteReceiver,
} from "../controllers/receiverController";
import validateRequest from "../middleware/validateRequest";
import authenticateJWT from "../middleware/authMiddleware";
import {
    getReceiverSchema,
    getReceiverByPhoneSchema,
    createReceiverSchema,
    createReceiversSchema,
    updateReceiverSchema,
    paginationSchema,
} from "../schemas/receiverSchema";

const router = express.Router();

// Public routes
router.get("/", validateRequest(paginationSchema), getAllReceivers);
router.get("/:id", validateRequest(getReceiverSchema), getReceiverById);
router.get("/phone/:phone", validateRequest(getReceiverByPhoneSchema), getReceiverByPhone);

// Protected routes (require authentication)
router.post(
    "/",
    authenticateJWT,
    (req, res, next) => {
        // Determine if it's a single or multiple receivers based on the request body
        const validationSchema = Array.isArray(req.body) ? createReceiversSchema : createReceiverSchema;
        validateRequest(validationSchema)(req, res, next);
    },
    (req, res, next) => {
        // Route to appropriate controller method
        if (Array.isArray(req.body)) {
            createReceivers(req, res, next);
        } else {
            createReceiver(req, res, next);
        }
    }
);

router.patch("/:id", authenticateJWT, validateRequest(updateReceiverSchema), updateReceiver);

router.delete("/:id", authenticateJWT, validateRequest(getReceiverSchema), deleteReceiver);

export default router;
