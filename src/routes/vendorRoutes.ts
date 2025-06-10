import express from "express";
import {
    createVendor,
    getAllVendors,
    getVendorByPhone,
    getVendorById,
    updateVendorByPhone,
    updateVendorById,
    deleteVendorByPhone,
    deleteVendorById,
} from "../controllers/vendorController";
import validateRequest from "../middleware/validateRequest";
import authenticateJWT from "../middleware/authMiddleware";
import {
    createVendorSchema,
    updateVendorByPhoneSchema,
    updateVendorByIdSchema,
    getVendorByPhoneSchema,
    getVendorByIdSchema,
    paginationSchema,
} from "../schemas/vendorSchema";

const router = express.Router();

// Public routes
router.get("/", validateRequest(paginationSchema), getAllVendors);
router.get("/phone/:phone", validateRequest(getVendorByPhoneSchema), getVendorByPhone);
router.get("/id/:id", validateRequest(getVendorByIdSchema), getVendorById);

// Protected routes
router.post("/", authenticateJWT, validateRequest(createVendorSchema), createVendor);
router.patch("/phone/:phone", authenticateJWT, validateRequest(updateVendorByPhoneSchema), updateVendorByPhone);
router.patch("/id/:id", authenticateJWT, validateRequest(updateVendorByIdSchema), updateVendorById);
router.delete("/phone/:phone", authenticateJWT, validateRequest(getVendorByPhoneSchema), deleteVendorByPhone);
router.delete("/id/:id", authenticateJWT, validateRequest(getVendorByIdSchema), deleteVendorById);

export default router;
