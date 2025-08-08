import express from "express";

import {
    createVendor,
    deleteVendorById,
    deleteVendorByPhone,
    getAllVendors,
    getVendorById,
    getVendorByPhone,
    updateVendorById,
    updateVendorByPhone,
} from "../controllers/vendorController";
import { UserRole } from "../enums";
import authenticateJWT from "../middleware/authMiddleware";
import validateRequest from "../middleware/validateRequest";
import validateRole from "../middleware/validateRole";
import {
    createVendorSchema,
    getVendorByIdSchema,
    getVendorByPhoneSchema,
    paginationSchema,
    updateVendorByIdSchema,
    updateVendorByPhoneSchema,
} from "../schemas/vendorSchema";

const router = express.Router();

// Public routes
router.get("/", validateRequest(paginationSchema), getAllVendors);
router.get("/phone/:phone", validateRequest(getVendorByPhoneSchema), getVendorByPhone);
router.get("/id/:id", validateRequest(getVendorByIdSchema), getVendorById);

// Protected routes
router.post(
    "/",
    authenticateJWT,
    validateRole([UserRole.ADMIN, UserRole.ISSUER, UserRole.APPROVER]),
    validateRequest(createVendorSchema),
    createVendor
);
router.patch(
    "/phone/:phone",
    authenticateJWT,
    validateRole([UserRole.ADMIN, UserRole.ISSUER, UserRole.APPROVER]),
    validateRequest(updateVendorByPhoneSchema),
    updateVendorByPhone
);
router.patch(
    "/id/:id",
    authenticateJWT,
    validateRole([UserRole.ADMIN, UserRole.ISSUER, UserRole.APPROVER]),
    validateRequest(updateVendorByIdSchema),
    updateVendorById
);
router.delete(
    "/phone/:phone",
    authenticateJWT,
    validateRole([UserRole.ADMIN, UserRole.ISSUER, UserRole.APPROVER]),
    validateRequest(getVendorByPhoneSchema),
    deleteVendorByPhone
);
router.delete(
    "/id/:id",
    authenticateJWT,
    validateRole([UserRole.ADMIN, UserRole.ISSUER, UserRole.APPROVER]),
    validateRequest(getVendorByIdSchema),
    deleteVendorById
);

export default router;
