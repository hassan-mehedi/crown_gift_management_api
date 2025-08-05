import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

import RequestModel from "../models/requestModel";
import StockItemModel from "../models/stockItemModel";
import { ExtendedRequest } from "../types";
import AppError from "../utils/appError";

// Get all stock items with pagination
export const getAllStockItems = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) ?? 1;
        const limit = parseInt(req.query.limit as string) || 100;
        const skip = (page - 1) * limit;

        const stockItems = await StockItemModel.find({ isApproved: true }).populate("vendorId").skip(skip).limit(limit);

        const totalStockItems = await StockItemModel.countDocuments({ isApproved: true });
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

        const stockItem = await StockItemModel.findOne({ _id: id, isApproved: true }).populate("vendorId");

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
export const createStockItem = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    try {
        const stockItemData = req.body;
        stockItemData.createdBy = req.user?.id;

        const stockItem = await StockItemModel.create(stockItemData);

        const requestData = {
            stockItemId: stockItem._id,
            createdBy: req.user?.id,
        };
        await RequestModel.create(requestData);

        return res.status(201).json({
            status: "success",
            data: { stockItem },
        });
    } catch (error) {
        next(error);
    }
};

// Create multiple stock items
export const createStockItems = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    try {
        const stockItemsData = req.body;

        // Add createdBy field to each stock item
        stockItemsData.forEach((item: any) => {
            item.createdBy = req.user?.id;
        });

        const stockItems = await StockItemModel.insertMany(stockItemsData);

        // Create requests for each stock item
        const requestsData = stockItems.map(item => ({
            stockItemId: item._id,
            createdBy: req.user?.id,
        }));
        await RequestModel.insertMany(requestsData);

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
