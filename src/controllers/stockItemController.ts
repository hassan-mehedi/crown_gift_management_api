import { Request, Response, NextFunction } from "express";
import StockItemModel from "../models/stockItemModel";
import AppError from "../utils/appError";
import mongoose from "mongoose";

// Get all stock items with pagination
export const getAllStockItems = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) ?? 1;
        const limit = parseInt(req.query.limit as string) || 100;
        const skip = (page - 1) * limit;

        const stockItems = await StockItemModel.find().skip(skip).limit(limit);

        const totalStockItems = await StockItemModel.countDocuments();
        const totalPages = Math.ceil(totalStockItems / limit);

        return res.status(200).json({
            status: "success",
            data: {
                stockItems,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: totalStockItems,
                    itemsPerPage: limit,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get a single stock item by ID
export const getStockItemById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("Invalid stock item ID", 400);
        }

        const stockItem = await StockItemModel.findById(id);

        if (!stockItem) {
            throw new AppError(`Stock item with ID ${id} not found`, 404);
        }

        return res.status(200).json({
            status: "success",
            data: { stockItem },
        });
    } catch (error) {
        next(error);
    }
};

// Create a new stock item
export const createStockItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const stockItemData = req.body;
        const stockItem = await StockItemModel.create(stockItemData);

        return res.status(201).json({
            status: "success",
            data: { stockItem },
        });
    } catch (error) {
        next(error);
    }
};

// Create multiple stock items
export const createStockItems = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const stockItemsData = req.body;
        const stockItems = await StockItemModel.insertMany(stockItemsData);

        return res.status(201).json({
            status: "success",
            data: { stockItems },
        });
    } catch (error) {
        next(error);
    }
};

// Update a stock item
export const updateStockItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("Invalid stock item ID", 400);
        }

        const stockItem = await StockItemModel.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!stockItem) {
            throw new AppError(`Stock item with ID ${id} not found`, 404);
        }

        return res.status(200).json({
            status: "success",
            data: { stockItem },
        });
    } catch (error) {
        next(error);
    }
};

// Delete a stock item
export const deleteStockItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("Invalid stock item ID", 400);
        }

        const stockItem = await StockItemModel.findByIdAndDelete(id);

        if (!stockItem) {
            throw new AppError(`Stock item with ID ${id} not found`, 404);
        }

        return res.status(200).json({
            status: "success",
            message: "Stock item deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};
