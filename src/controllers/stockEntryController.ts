import { Request, Response, NextFunction } from "express";
import StockEntryModel from "../models/stockEntryModel";
import AppError from "../utils/appError";
import mongoose from "mongoose";

// Get all stock entries with pagination
export const getAllStockEntries = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) ?? 1;
        const limit = parseInt(req.query.limit as string) || 100;
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
        const { id } = req.params;

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
        const stockEntryData = req.body;
        const stockEntry = await StockEntryModel.create(stockEntryData);
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
        const stockEntriesData = req.body;
        const stockEntries = await StockEntryModel.insertMany(stockEntriesData);
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
        const { id } = req.params;
        const updateData = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("Invalid stock entry ID", 400);
        }

        const stockEntry = await StockEntryModel.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        }).populate("stockItemId");

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

// Delete a stock entry
export const deleteStockEntry = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("Invalid stock entry ID", 400);
        }

        const stockEntry = await StockEntryModel.findByIdAndDelete(id);

        if (!stockEntry) {
            throw new AppError(`Stock entry with ID ${id} not found`, 404);
        }

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
        const { stockItemId } = req.params;
        const page = parseInt(req.query.page as string) ?? 1;
        const limit = parseInt(req.query.limit as string) || 100;
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
        const { stockItemId } = req.params;

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
