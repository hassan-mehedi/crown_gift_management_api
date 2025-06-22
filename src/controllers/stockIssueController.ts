import { Request, Response, NextFunction } from "express";
import StockIssueModel from "../models/stockIssueModel";
import StockItemModel from "../models/stockItemModel";
import ReceiverModel from "../models/receiverModel";
import AppError from "../utils/appError";
import mongoose from "mongoose";

// Get all stock issues with pagination
export const getAllStockIssues = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 100;
        const skip = (page - 1) * limit;

        const stockIssues = await StockIssueModel.find()
            .populate({
                path: "stockItemId",
                populate: {
                    path: "vendorId",
                },
            })
            .populate("receiverId")
            .skip(skip)
            .limit(limit);

        const totalStockIssues = await StockIssueModel.countDocuments();
        const totalPages = Math.ceil(totalStockIssues / limit);

        return res.status(200).json({
            status: "success",
            data: {
                stockIssues,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: totalStockIssues,
                    itemsPerPage: limit,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get a single stock issue by ID
export const getStockIssueById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("Invalid stock issue ID", 400);
        }

        const stockIssue = await StockIssueModel.findById(id)
            .populate({
                path: "stockItemId",
                populate: {
                    path: "vendorId",
                },
            })
            .populate("receiverId");

        if (!stockIssue) {
            throw new AppError(`Stock issue with ID ${id} not found`, 404);
        }

        return res.status(200).json({
            status: "success",
            data: { stockIssue },
        });
    } catch (error) {
        next(error);
    }
};

// Get stock issues by receiver ID
export const getStockIssuesByReceiverId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { receiverId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 100;
        const skip = (page - 1) * limit;

        if (!mongoose.Types.ObjectId.isValid(receiverId)) {
            throw new AppError("Invalid receiver ID", 400);
        }

        // Check if receiver exists
        const receiver = await ReceiverModel.findById(receiverId);
        if (!receiver) {
            throw new AppError(`Receiver with ID ${receiverId} not found`, 404);
        }

        const stockIssues = await StockIssueModel.find({ receiverId })
            .populate({
                path: "stockItemId",
                populate: {
                    path: "vendorId",
                },
            })
            .skip(skip)
            .limit(limit);
        const totalStockIssues = await StockIssueModel.countDocuments({ receiverId });
        const totalPages = Math.ceil(totalStockIssues / limit);

        return res.status(200).json({
            status: "success",
            data: {
                stockIssues,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: totalStockIssues,
                    itemsPerPage: limit,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get stock issues by stock item ID
export const getStockIssuesByStockItemId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { stockItemId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 100;
        const skip = (page - 1) * limit;

        if (!mongoose.Types.ObjectId.isValid(stockItemId)) {
            throw new AppError("Invalid stock item ID", 400);
        }

        // Check if stock item exists
        const stockItem = await StockItemModel.findById(stockItemId);
        if (!stockItem) {
            throw new AppError(`Stock item with ID ${stockItemId} not found`, 404);
        }

        const stockIssues = await StockIssueModel.find({ stockItemId })
            .populate({
                path: "stockItemId",
                populate: {
                    path: "vendorId",
                },
            })
            .skip(skip)
            .limit(limit);
        const totalStockIssues = await StockIssueModel.countDocuments({ stockItemId });
        const totalPages = Math.ceil(totalStockIssues / limit);

        return res.status(200).json({
            status: "success",
            data: {
                stockIssues,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: totalStockIssues,
                    itemsPerPage: limit,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

// Create a new stock issue
export const createStockIssue = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const stockIssueData = req.body;

        // Check if stock item exists
        if (!mongoose.Types.ObjectId.isValid(stockIssueData.stockItemId)) {
            throw new AppError("Invalid stock item ID", 400);
        }
        const stockItem = await StockItemModel.findById(stockIssueData.stockItemId);
        if (!stockItem) {
            throw new AppError(`Stock item with ID ${stockIssueData.stockItemId} not found`, 404);
        }

        // Check if receiver exists
        if (!mongoose.Types.ObjectId.isValid(stockIssueData.receiverId)) {
            throw new AppError("Invalid receiver ID", 400);
        }
        const receiver = await ReceiverModel.findById(stockIssueData.receiverId);
        if (!receiver) {
            throw new AppError(`Receiver with ID ${stockIssueData.receiverId} not found`, 404);
        }

        // Check if there's enough stock
        if (stockItem.quantity < stockIssueData.quantity) {
            throw new AppError(`Not enough stock. Available: ${stockItem.quantity}, Requested: ${stockIssueData.quantity}`, 400);
        }

        // Create stock issue without using transaction
        const stockIssue = await StockIssueModel.create(stockIssueData);

        // Update stock quantity
        await StockItemModel.findByIdAndUpdate(stockIssueData.stockItemId, { $inc: { quantity: -stockIssueData.quantity } });

        return res.status(201).json({
            status: "success",
            data: { stockIssue },
        });
    } catch (error) {
        next(error);
    }
};

// Helper functions for updateStockIssue
const validateStockIssueId = async (id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid stock issue ID", 400);
    }

    const stockIssue = await StockIssueModel.findById(id);
    if (!stockIssue) {
        throw new AppError(`Stock issue with ID ${id} not found`, 404);
    }

    return stockIssue;
};

const validateStockItem = async (stockItemId: string, existingStockItemId: string) => {
    if (stockItemId && stockItemId !== existingStockItemId) {
        if (!mongoose.Types.ObjectId.isValid(stockItemId)) {
            throw new AppError("Invalid stock item ID", 400);
        }

        const stockItem = await StockItemModel.findById(stockItemId);
        if (!stockItem) {
            throw new AppError(`Stock item with ID ${stockItemId} not found`, 404);
        }
    }
};

const validateReceiver = async (receiverId: string, existingReceiverId: string) => {
    if (receiverId && receiverId !== existingReceiverId) {
        if (!mongoose.Types.ObjectId.isValid(receiverId)) {
            throw new AppError("Invalid receiver ID", 400);
        }

        const receiver = await ReceiverModel.findById(receiverId);
        if (!receiver) {
            throw new AppError(`Receiver with ID ${receiverId} not found`, 404);
        }
    }
};

const checkStockAvailability = async (stockItemId: string, requestedQuantity: number, existingQuantity: number) => {
    const stockItem = await StockItemModel.findById(stockItemId);

    if (!stockItem) {
        throw new AppError(`Stock item with ID ${stockItemId} not found`, 404);
    }

    const availableStock = stockItem.quantity + existingQuantity;

    if (availableStock < requestedQuantity) {
        throw new AppError(`Not enough stock. Available: ${availableStock}, Requested: ${requestedQuantity}`, 400);
    }

    return stockItem;
};

// Update a stock issue
export const updateStockIssue = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Validate and get existing stock issue
        const existingStockIssue = await validateStockIssueId(id);

        // Validate related entities
        await Promise.all([
            validateStockItem(updateData.stockItemId, existingStockIssue.stockItemId),
            validateReceiver(updateData.receiverId, existingStockIssue.receiverId),
        ]);

        // Check stock if quantity is being updated
        if (updateData.quantity && updateData.quantity !== existingStockIssue.quantity) {
            const stockItemId = updateData.stockItemId ?? existingStockIssue.stockItemId;
            await checkStockAvailability(stockItemId, updateData.quantity, existingStockIssue.quantity);
        }

        // Update the stock issue
        const stockIssue = await StockIssueModel.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        // If quantity changed, update stock
        if (updateData.quantity && updateData.quantity !== existingStockIssue.quantity) {
            const stockItemId = updateData.stockItemId ?? existingStockIssue.stockItemId;
            const quantityDifference = existingStockIssue.quantity - updateData.quantity;

            await StockItemModel.findByIdAndUpdate(stockItemId, { $inc: { quantity: quantityDifference } });
        }

        return res.status(200).json({
            status: "success",
            data: { stockIssue },
        });
    } catch (error) {
        next(error);
    }
};

// Delete a stock issue
export const deleteStockIssue = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("Invalid stock issue ID", 400);
        }

        const stockIssue = await StockIssueModel.findById(id);

        if (!stockIssue) {
            throw new AppError(`Stock issue with ID ${id} not found`, 404);
        }

        // Delete the stock issue
        await StockIssueModel.findByIdAndDelete(id);

        // Restore stock quantity
        await StockItemModel.findByIdAndUpdate(stockIssue.stockItemId, { $inc: { quantity: stockIssue.quantity } });

        return res.status(200).json({
            status: "success",
            message: "Stock issue deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};
