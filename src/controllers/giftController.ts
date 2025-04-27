import { Request, Response, NextFunction } from "express";
import GiftModel from "../models/giftModel";
import StockItemModel from "../models/stockItemModel";
import ReceiverModel from "../models/receiverModel";
import AppError from "../utils/appError";
import mongoose from "mongoose";

// Get all gifts with pagination
export const getAllGifts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const gifts = await GiftModel.find().populate("stockItemId").populate("receiverId").skip(skip).limit(limit);

        const totalGifts = await GiftModel.countDocuments();
        const totalPages = Math.ceil(totalGifts / limit);

        return res.status(200).json({
            status: "success",
            data: {
                gifts,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: totalGifts,
                    itemsPerPage: limit,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get a single gift by ID
export const getGiftById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("Invalid gift ID", 400);
        }

        const gift = await GiftModel.findById(id).populate("stockItemId").populate("receiverId");

        if (!gift) {
            throw new AppError(`Gift with ID ${id} not found`, 404);
        }

        return res.status(200).json({
            status: "success",
            data: { gift },
        });
    } catch (error) {
        next(error);
    }
};

// Get gifts by receiver ID
export const getGiftsByReceiverId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { receiverId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        if (!mongoose.Types.ObjectId.isValid(receiverId)) {
            throw new AppError("Invalid receiver ID", 400);
        }

        // Check if receiver exists
        const receiver = await ReceiverModel.findById(receiverId);
        if (!receiver) {
            throw new AppError(`Receiver with ID ${receiverId} not found`, 404);
        }

        const gifts = await GiftModel.find({ receiverId }).populate("stockItemId").skip(skip).limit(limit);
        const totalGifts = await GiftModel.countDocuments({ receiverId });
        const totalPages = Math.ceil(totalGifts / limit);

        return res.status(200).json({
            status: "success",
            data: {
                gifts,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: totalGifts,
                    itemsPerPage: limit,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get gifts by stock item ID
export const getGiftsByStockItemId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { stockItemId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        if (!mongoose.Types.ObjectId.isValid(stockItemId)) {
            throw new AppError("Invalid stock item ID", 400);
        }

        // Check if stock item exists
        const stockItem = await StockItemModel.findById(stockItemId);
        if (!stockItem) {
            throw new AppError(`Stock item with ID ${stockItemId} not found`, 404);
        }

        const gifts = await GiftModel.find({ stockItemId }).populate("stockItemId").skip(skip).limit(limit);
        const totalGifts = await GiftModel.countDocuments({ stockItemId });
        const totalPages = Math.ceil(totalGifts / limit);

        return res.status(200).json({
            status: "success",
            data: {
                gifts,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: totalGifts,
                    itemsPerPage: limit,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

// Create a new gift
export const createGift = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const giftData = req.body;

        // Check if stock item exists
        if (!mongoose.Types.ObjectId.isValid(giftData.stockItemId)) {
            throw new AppError("Invalid stock item ID", 400);
        }
        const stockItem = await StockItemModel.findById(giftData.stockItemId);
        if (!stockItem) {
            throw new AppError(`Stock item with ID ${giftData.stockItemId} not found`, 404);
        }

        // Check if receiver exists
        if (!mongoose.Types.ObjectId.isValid(giftData.receiverId)) {
            throw new AppError("Invalid receiver ID", 400);
        }
        const receiver = await ReceiverModel.findById(giftData.receiverId);
        if (!receiver) {
            throw new AppError(`Receiver with ID ${giftData.receiverId} not found`, 404);
        }

        // Check if there's enough stock
        if (stockItem.quantity < giftData.quantity) {
            throw new AppError(`Not enough stock. Available: ${stockItem.quantity}, Requested: ${giftData.quantity}`, 400);
        }

        // Create gift without using transaction
        const gift = await GiftModel.create(giftData);

        // Update stock quantity
        await StockItemModel.findByIdAndUpdate(giftData.stockItemId, { $inc: { quantity: -giftData.quantity } });

        return res.status(201).json({
            status: "success",
            data: { gift },
        });
    } catch (error) {
        next(error);
    }
};

// Helper functions for updateGift
const validateGiftId = async (id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid gift ID", 400);
    }

    const gift = await GiftModel.findById(id);
    if (!gift) {
        throw new AppError(`Gift with ID ${id} not found`, 404);
    }

    return gift;
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

// Update a gift
export const updateGift = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Validate and get existing gift
        const existingGift = await validateGiftId(id);

        // Validate related entities
        await Promise.all([
            validateStockItem(updateData.stockItemId, existingGift.stockItemId),
            validateReceiver(updateData.receiverId, existingGift.receiverId),
        ]);

        // Check stock if quantity is being updated
        if (updateData.quantity && updateData.quantity !== existingGift.quantity) {
            const stockItemId = updateData.stockItemId ?? existingGift.stockItemId;
            await checkStockAvailability(stockItemId, updateData.quantity, existingGift.quantity);
        }

        // Update the gift
        const gift = await GiftModel.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        // If quantity changed, update stock
        if (updateData.quantity && updateData.quantity !== existingGift.quantity) {
            const stockItemId = updateData.stockItemId ?? existingGift.stockItemId;
            const quantityDifference = existingGift.quantity - updateData.quantity;

            await StockItemModel.findByIdAndUpdate(stockItemId, { $inc: { quantity: quantityDifference } });
        }

        return res.status(200).json({
            status: "success",
            data: { gift },
        });
    } catch (error) {
        next(error);
    }
};

// Delete a gift
export const deleteGift = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("Invalid gift ID", 400);
        }

        const gift = await GiftModel.findById(id);

        if (!gift) {
            throw new AppError(`Gift with ID ${id} not found`, 404);
        }

        // Delete the gift
        await GiftModel.findByIdAndDelete(id);

        // Restore stock quantity
        await StockItemModel.findByIdAndUpdate(gift.stockItemId, { $inc: { quantity: gift.quantity } });

        return res.status(200).json({
            status: "success",
            message: "Gift deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};
