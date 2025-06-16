import { Request, Response, NextFunction } from "express";
import StockModificationModel from "../models/stockModificationModel";
import StockItemModel from "../models/stockItemModel";
import AppError from "../utils/appError";
import mongoose from "mongoose";
import {
    createStockModificationSchema,
    createStockModificationsSchema,
    updateStockModificationSchema,
    getStockModificationSchema,
    getStockModificationsByStockItemSchema,
    getStockModificationCountSchema,
    paginationSchema,
} from "../schemas/stockModificationSchema";

// Get all stock modifications with pagination
export const getAllStockModifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate query parameters
        const { query } = paginationSchema.parse({ query: req.query });
        const { page, limit } = query;
        const skip = (page - 1) * limit;

        const stockModifications = await StockModificationModel.find().skip(skip).limit(limit).populate("stockItemId");

        const totalStockModifications = await StockModificationModel.countDocuments();
        const totalPages = Math.ceil(totalStockModifications / limit);

        return res.status(200).json({
            status: "success",
            data: {
                stockModifications,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: totalStockModifications,
                    itemsPerPage: limit,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get a single stock modification by ID
export const getStockModificationById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate request parameters
        const { params } = getStockModificationSchema.parse({ params: req.params });
        const { id } = params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("Invalid stock modification ID", 400);
        }

        const stockModification = await StockModificationModel.findById(id).populate("stockItemId");

        if (!stockModification) {
            throw new AppError(`Stock modification with ID ${id} not found`, 404);
        }

        return res.status(200).json({
            status: "success",
            data: { stockModification },
        });
    } catch (error) {
        next(error);
    }
};

// Create a new stock modification
export const createStockModification = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate request body
        const { body: stockModificationData } = createStockModificationSchema.parse({ body: req.body });

        // Validate stock item ID
        if (!mongoose.Types.ObjectId.isValid(stockModificationData.stockItemId)) {
            throw new AppError("Invalid stock item ID", 400);
        }

        // Check if stock item exists
        const stockItem = await StockItemModel.findById(stockModificationData.stockItemId);
        if (!stockItem) {
            throw new AppError(`Stock item with ID ${stockModificationData.stockItemId} not found`, 404);
        }

        // Create the stock modification
        const stockModification = await StockModificationModel.create(stockModificationData);

        // Increase stock item quantity
        await StockItemModel.findByIdAndUpdate(stockModificationData.stockItemId, {
            $inc: { quantity: stockModificationData.quantity },
        });

        const populatedStockModification = await StockModificationModel.findById(stockModification._id).populate("stockItemId");

        return res.status(201).json({
            status: "success",
            data: { stockModification: populatedStockModification },
        });
    } catch (error) {
        next(error);
    }
};

// Create multiple stock modifications
export const createStockModifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate request body
        const { body: stockModificationsData } = createStockModificationsSchema.parse({ body: req.body });

        // Validate all stock item IDs and check if they exist
        for (const modificationData of stockModificationsData) {
            if (!mongoose.Types.ObjectId.isValid(modificationData.stockItemId)) {
                throw new AppError(`Invalid stock item ID: ${modificationData.stockItemId}`, 400);
            }

            const stockItem = await StockItemModel.findById(modificationData.stockItemId);
            if (!stockItem) {
                throw new AppError(`Stock item with ID ${modificationData.stockItemId} not found`, 404);
            }
        }

        // Create all stock modifications
        const stockModifications = await StockModificationModel.insertMany(stockModificationsData);

        // Update stock quantities for each stock item
        const stockUpdates = new Map();
        for (const modificationData of stockModificationsData) {
            const currentQuantity = stockUpdates.get(modificationData.stockItemId) ?? 0;
            stockUpdates.set(modificationData.stockItemId, currentQuantity + modificationData.quantity);
        }

        // Apply all stock updates
        const updatePromises = [];
        for (const [stockItemId, quantityToAdd] of stockUpdates) {
            updatePromises.push(
                StockItemModel.findByIdAndUpdate(stockItemId, {
                    $inc: { quantity: quantityToAdd },
                })
            );
        }
        await Promise.all(updatePromises);

        const populatedStockModifications = await StockModificationModel.find({
            _id: { $in: stockModifications.map(modification => modification._id) },
        }).populate("stockItemId");

        return res.status(201).json({
            status: "success",
            data: { stockModifications: populatedStockModifications },
        });
    } catch (error) {
        next(error);
    }
};

// Update a stock modification
export const updateStockModification = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate request parameters and body
        const { params, body: updateData } = updateStockModificationSchema.parse({
            params: req.params,
            body: req.body,
        });
        const { id } = params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("Invalid stock modification ID", 400);
        }

        // Get the existing stock modification
        const existingStockModification = await StockModificationModel.findById(id);
        if (!existingStockModification) {
            throw new AppError(`Stock modification with ID ${id} not found`, 404);
        }

        // If stock item ID is being changed, validate the new one
        if (updateData.stockItemId && updateData.stockItemId !== existingStockModification.stockItemId) {
            if (!mongoose.Types.ObjectId.isValid(updateData.stockItemId)) {
                throw new AppError("Invalid stock item ID", 400);
            }

            const stockItem = await StockItemModel.findById(updateData.stockItemId);
            if (!stockItem) {
                throw new AppError(`Stock item with ID ${updateData.stockItemId} not found`, 404);
            }
        }

        // Update the stock modification
        const stockModification = await StockModificationModel.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        }).populate("stockItemId");

        // Handle stock quantity updates
        const oldStockItemId = existingStockModification.stockItemId;
        const newStockItemId = updateData.stockItemId ?? oldStockItemId;
        const oldQuantity = existingStockModification.quantity;
        const newQuantity = updateData.quantity ?? oldQuantity;

        if (oldStockItemId === newStockItemId) {
            // Same stock item, just adjust the quantity difference
            const quantityDifference = newQuantity - oldQuantity;
            if (quantityDifference !== 0) {
                await StockItemModel.findByIdAndUpdate(oldStockItemId, {
                    $inc: { quantity: quantityDifference },
                });
            }
        } else {
            // Different stock item, remove from old and add to new
            await Promise.all([
                StockItemModel.findByIdAndUpdate(oldStockItemId, {
                    $inc: { quantity: -oldQuantity },
                }),
                StockItemModel.findByIdAndUpdate(newStockItemId, {
                    $inc: { quantity: newQuantity },
                }),
            ]);
        }

        return res.status(200).json({
            status: "success",
            data: { stockModification },
        });
    } catch (error) {
        next(error);
    }
};

// Delete a stock modification
export const deleteStockModification = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate request parameters
        const { params } = getStockModificationSchema.parse({ params: req.params });
        const { id } = params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("Invalid stock modification ID", 400);
        }

        const stockModification = await StockModificationModel.findById(id);

        if (!stockModification) {
            throw new AppError(`Stock modification with ID ${id} not found`, 404);
        }

        // Delete the stock modification
        await StockModificationModel.findByIdAndDelete(id);

        // Decrease stock item quantity (remove the quantity that was added by this modification)
        await StockItemModel.findByIdAndUpdate(stockModification.stockItemId, {
            $inc: { quantity: -stockModification.quantity },
        });

        return res.status(200).json({
            status: "success",
            message: "Stock modification deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

// Get stock modifications by stock item ID
export const getStockModificationsByStockItemId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate request parameters and query
        const { params, query } = getStockModificationsByStockItemSchema.parse({
            params: req.params,
            query: req.query,
        });
        const { stockItemId } = params;
        const { page, limit } = query;
        const skip = (page - 1) * limit;

        if (!mongoose.Types.ObjectId.isValid(stockItemId)) {
            throw new AppError("Invalid stock item ID", 400);
        }

        const stockModifications = await StockModificationModel.find({ stockItemId })
            .skip(skip)
            .limit(limit)
            .populate("stockItemId")
            .sort({ date: -1 });

        const totalStockModifications = await StockModificationModel.countDocuments({ stockItemId });
        const totalPages = Math.ceil(totalStockModifications / limit);

        return res.status(200).json({
            status: "success",
            data: {
                stockModifications,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: totalStockModifications,
                    itemsPerPage: limit,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get count of stock modifications for a stock item
export const getStockModificationCountByStockItemId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate request parameters
        const { params } = getStockModificationCountSchema.parse({ params: req.params });
        const { stockItemId } = params;

        if (!mongoose.Types.ObjectId.isValid(stockItemId)) {
            throw new AppError("Invalid stock item ID", 400);
        }

        const count = await StockModificationModel.countDocuments({ stockItemId });
        const totalQuantity = await StockModificationModel.aggregate([
            { $match: { stockItemId: new mongoose.Types.ObjectId(stockItemId) } },
            { $group: { _id: null, totalQuantity: { $sum: "$quantity" } } },
        ]);

        return res.status(200).json({
            status: "success",
            data: {
                stockItemId,
                totalModifications: count,
                totalQuantityAdded: totalQuantity.length > 0 ? totalQuantity[0].totalQuantity : 0,
            },
        });
    } catch (error) {
        next(error);
    }
};
