import { Request, Response, NextFunction } from "express";
import StockEntryModel from "../models/stockEntryModel";
import StockItemModel from "../models/stockItemModel";
import AppError from "../utils/appError";
import mongoose from "mongoose";
import {
    createStockEntrySchema,
    createStockEntriesSchema,
    updateStockEntrySchema,
    getStockEntrySchema,
    getStockEntriesByStockItemSchema,
    getStockEntryCountSchema,
    paginationSchema,
} from "../schemas/stockEntrySchema";

// Get all stock entries with pagination
export const getAllStockEntries = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate query parameters
        const { query } = paginationSchema.parse({ query: req.query });
        const { page, limit } = query;
        const skip = (page - 1) * limit;

        const stockEntries = await StockEntryModel.find().skip(skip).limit(limit).populate("stockItemId");

        const totalStockEntries = await StockEntryModel.countDocuments();
        const totalPages = Math.ceil(totalStockEntries / limit);

        return res.status(200).json({
            status: "success",
            data: {
                stockEntries,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: totalStockEntries,
                    itemsPerPage: limit,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get a single stock entry by ID
export const getStockEntryById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate request parameters
        const { params } = getStockEntrySchema.parse({ params: req.params });
        const { id } = params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("Invalid stock entry ID", 400);
        }

        const stockEntry = await StockEntryModel.findById(id).populate("stockItemId");

        if (!stockEntry) {
            throw new AppError(`Stock entry with ID ${id} not found`, 404);
        }

        return res.status(200).json({
            status: "success",
            data: { stockEntry },
        });
    } catch (error) {
        next(error);
    }
};

// Create a new stock entry
export const createStockEntry = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate request body
        const { body: stockEntryData } = createStockEntrySchema.parse({ body: req.body });

        // Validate stock item ID
        if (!mongoose.Types.ObjectId.isValid(stockEntryData.stockItemId)) {
            throw new AppError("Invalid stock item ID", 400);
        }

        // Check if stock item exists
        const stockItem = await StockItemModel.findById(stockEntryData.stockItemId);
        if (!stockItem) {
            throw new AppError(`Stock item with ID ${stockEntryData.stockItemId} not found`, 404);
        }

        // Create the stock entry
        const stockEntry = await StockEntryModel.create(stockEntryData);

        // Increase stock item quantity
        await StockItemModel.findByIdAndUpdate(stockEntryData.stockItemId, {
            $inc: { quantity: stockEntryData.quantity },
        });

        const populatedStockEntry = await StockEntryModel.findById(stockEntry._id).populate("stockItemId");

        return res.status(201).json({
            status: "success",
            data: { stockEntry: populatedStockEntry },
        });
    } catch (error) {
        next(error);
    }
};

// Create multiple stock entries
export const createStockEntries = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate request body
        const { body: stockEntriesData } = createStockEntriesSchema.parse({ body: req.body });

        // Validate all stock item IDs and check if they exist
        for (const entryData of stockEntriesData) {
            if (!mongoose.Types.ObjectId.isValid(entryData.stockItemId)) {
                throw new AppError(`Invalid stock item ID: ${entryData.stockItemId}`, 400);
            }

            const stockItem = await StockItemModel.findById(entryData.stockItemId);
            if (!stockItem) {
                throw new AppError(`Stock item with ID ${entryData.stockItemId} not found`, 404);
            }
        }

        // Create all stock entries
        const stockEntries = await StockEntryModel.insertMany(stockEntriesData);

        // Update stock quantities for each stock item
        const stockUpdates = new Map();
        for (const entryData of stockEntriesData) {
            const currentQuantity = stockUpdates.get(entryData.stockItemId) ?? 0;
            stockUpdates.set(entryData.stockItemId, currentQuantity + entryData.quantity);
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

        const populatedStockEntries = await StockEntryModel.find({
            _id: { $in: stockEntries.map(entry => entry._id) },
        }).populate("stockItemId");

        return res.status(201).json({
            status: "success",
            data: { stockEntries: populatedStockEntries },
        });
    } catch (error) {
        next(error);
    }
};

// Update a stock entry
export const updateStockEntry = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate request parameters and body
        const { params, body: updateData } = updateStockEntrySchema.parse({
            params: req.params,
            body: req.body,
        });
        const { id } = params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("Invalid stock entry ID", 400);
        }

        // Get the existing stock entry
        const existingStockEntry = await StockEntryModel.findById(id);
        if (!existingStockEntry) {
            throw new AppError(`Stock entry with ID ${id} not found`, 404);
        }

        // If stock item ID is being changed, validate the new one
        if (updateData.stockItemId && updateData.stockItemId !== existingStockEntry.stockItemId) {
            if (!mongoose.Types.ObjectId.isValid(updateData.stockItemId)) {
                throw new AppError("Invalid stock item ID", 400);
            }

            const stockItem = await StockItemModel.findById(updateData.stockItemId);
            if (!stockItem) {
                throw new AppError(`Stock item with ID ${updateData.stockItemId} not found`, 404);
            }
        }

        // Update the stock entry
        const stockEntry = await StockEntryModel.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        }).populate("stockItemId");

        // Handle stock quantity updates
        const oldStockItemId = existingStockEntry.stockItemId;
        const newStockItemId = updateData.stockItemId ?? oldStockItemId;
        const oldQuantity = existingStockEntry.quantity;
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
            data: { stockEntry },
        });
    } catch (error) {
        next(error);
    }
};

// Delete a stock entry
export const deleteStockEntry = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate request parameters
        const { params } = getStockEntrySchema.parse({ params: req.params });
        const { id } = params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("Invalid stock entry ID", 400);
        }

        const stockEntry = await StockEntryModel.findById(id);

        if (!stockEntry) {
            throw new AppError(`Stock entry with ID ${id} not found`, 404);
        }

        // Delete the stock entry
        await StockEntryModel.findByIdAndDelete(id);

        // Decrease stock item quantity (remove the quantity that was added by this entry)
        await StockItemModel.findByIdAndUpdate(stockEntry.stockItemId, {
            $inc: { quantity: -stockEntry.quantity },
        });

        return res.status(200).json({
            status: "success",
            message: "Stock entry deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

// Get stock entries by stock item ID
export const getStockEntriesByStockItemId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate request parameters and query
        const { params, query } = getStockEntriesByStockItemSchema.parse({
            params: req.params,
            query: req.query,
        });
        const { stockItemId } = params;
        const { page, limit } = query;
        const skip = (page - 1) * limit;

        if (!mongoose.Types.ObjectId.isValid(stockItemId)) {
            throw new AppError("Invalid stock item ID", 400);
        }

        const stockEntries = await StockEntryModel.find({ stockItemId }).skip(skip).limit(limit).populate("stockItemId").sort({ date: -1 });

        const totalStockEntries = await StockEntryModel.countDocuments({ stockItemId });
        const totalPages = Math.ceil(totalStockEntries / limit);

        return res.status(200).json({
            status: "success",
            data: {
                stockEntries,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: totalStockEntries,
                    itemsPerPage: limit,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get count of stock entries for a stock item
export const getStockEntryCountByStockItemId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate request parameters
        const { params } = getStockEntryCountSchema.parse({ params: req.params });
        const { stockItemId } = params;

        if (!mongoose.Types.ObjectId.isValid(stockItemId)) {
            throw new AppError("Invalid stock item ID", 400);
        }

        const count = await StockEntryModel.countDocuments({ stockItemId });
        const totalQuantity = await StockEntryModel.aggregate([
            { $match: { stockItemId: new mongoose.Types.ObjectId(stockItemId) } },
            { $group: { _id: null, totalQuantity: { $sum: "$quantity" } } },
        ]);

        return res.status(200).json({
            status: "success",
            data: {
                stockItemId,
                totalEntries: count,
                totalQuantityAdded: totalQuantity.length > 0 ? totalQuantity[0].totalQuantity : 0,
            },
        });
    } catch (error) {
        next(error);
    }
};
