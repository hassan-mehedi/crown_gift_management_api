import { Request, Response, NextFunction } from "express";
import VendorModel from "../models/vendorModel";
import AppError from "../utils/appError";

// Create a new vendor
export const createVendor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const vendorData = req.body;

        // Check if vendor with this phone already exists
        const existingVendor = await VendorModel.findOne({ phone: vendorData.phone });
        if (existingVendor) {
            throw new AppError(`Vendor with phone ${vendorData.phone} already exists`, 400);
        }

        // Create the vendor
        const vendor = await VendorModel.create(vendorData);

        return res.status(201).json({
            status: "success",
            message: "Vendor created successfully",
            data: { vendor },
        });
    } catch (error) {
        next(error);
    }
};

// Get all vendors with pagination
export const getAllVendors = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) ?? 1;
        const limit = parseInt(req.query.limit as string) || 100;
        const skip = (page - 1) * limit;

        const vendors = await VendorModel.find().skip(skip).limit(limit);

        const totalVendors = await VendorModel.countDocuments();
        const totalPages = Math.ceil(totalVendors / limit);

        return res.status(200).json({
            status: "success",
            data: {
                vendors,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: totalVendors,
                    itemsPerPage: limit,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get a single vendor by phone
export const getVendorByPhone = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { phone } = req.params;
        const vendor = await VendorModel.findOne({ phone });

        if (!vendor) {
            throw new AppError(`Vendor with phone ${phone} not found`, 404);
        }

        return res.status(200).json({
            status: "success",
            data: { vendor },
        });
    } catch (error) {
        next(error);
    }
};

// Get a single vendor by ID
export const getVendorById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const vendor = await VendorModel.findById(id);

        if (!vendor) {
            throw new AppError(`Vendor with ID ${id} not found`, 404);
        }

        return res.status(200).json({
            status: "success",
            data: { vendor },
        });
    } catch (error) {
        next(error);
    }
};

// Update a vendor by phone
export const updateVendorByPhone = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { phone } = req.params;
        const updateData = { ...req.body };

        const vendor = await VendorModel.findOneAndUpdate({ phone }, updateData, {
            new: true,
            runValidators: true,
        });

        if (!vendor) {
            throw new AppError(`Vendor with phone ${phone} not found`, 404);
        }

        return res.status(200).json({
            status: "success",
            message: "Vendor updated successfully",
            data: { vendor },
        });
    } catch (error) {
        next(error);
    }
};

// Update a vendor by ID
export const updateVendorById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        const vendor = await VendorModel.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!vendor) {
            throw new AppError(`Vendor with ID ${id} not found`, 404);
        }

        return res.status(200).json({
            status: "success",
            message: "Vendor updated successfully",
            data: { vendor },
        });
    } catch (error) {
        next(error);
    }
};

// Delete a vendor by phone
export const deleteVendorByPhone = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { phone } = req.params;

        const vendor = await VendorModel.findOneAndDelete({ phone });

        if (!vendor) {
            throw new AppError(`Vendor with phone ${phone} not found`, 404);
        }

        return res.status(200).json({
            status: "success",
            message: "Vendor deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

// Delete a vendor by ID
export const deleteVendorById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const vendor = await VendorModel.findByIdAndDelete(id);

        if (!vendor) {
            throw new AppError(`Vendor with ID ${id} not found`, 404);
        }

        return res.status(200).json({
            status: "success",
            message: "Vendor deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};
