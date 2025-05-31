import { Request, Response, NextFunction } from "express";
import ReceiverModel from "../models/receiverModel";
import AppError from "../utils/appError";
import mongoose from "mongoose";

// Get all receivers with pagination
export const getAllReceivers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) ?? 1;
        const limit = parseInt(req.query.limit as string) || 100;
        const skip = (page - 1) * limit;

        const receivers = await ReceiverModel.find().skip(skip).limit(limit);

        const totalReceivers = await ReceiverModel.countDocuments();
        const totalPages = Math.ceil(totalReceivers / limit);

        return res.status(200).json({
            status: "success",
            data: {
                receivers,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: totalReceivers,
                    itemsPerPage: limit,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get a single receiver by ID
export const getReceiverById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("Invalid receiver ID", 400);
        }

        const receiver = await ReceiverModel.findById(id);

        if (!receiver) {
            throw new AppError(`Receiver with ID ${id} not found`, 404);
        }

        return res.status(200).json({
            status: "success",
            data: { receiver },
        });
    } catch (error) {
        next(error);
    }
};

// Get a receiver by phone
export const getReceiverByPhone = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { phone } = req.params;
        const receiver = await ReceiverModel.findOne({ phone });

        if (!receiver) {
            throw new AppError(`Receiver with phone ${phone} not found`, 404);
        }

        return res.status(200).json({
            status: "success",
            data: { receiver },
        });
    } catch (error) {
        next(error);
    }
};

// Create a new receiver
export const createReceiver = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const receiverData = req.body;

        // Check if receiver with this phone already exists
        const existingReceiver = await ReceiverModel.findOne({ phone: receiverData.phone });
        if (existingReceiver) {
            throw new AppError(`Receiver with phone ${receiverData.phone} already exists`, 400);
        }

        const receiver = await ReceiverModel.create(receiverData);

        return res.status(201).json({
            status: "success",
            data: { receiver },
        });
    } catch (error) {
        next(error);
    }
};

// Create multiple receivers
export const createReceivers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const receiversData = req.body;

        // Check for duplicate phones
        const phones = receiversData.map((receiver: any) => receiver.phone);
        const existingReceivers = await ReceiverModel.find({ phone: { $in: phones } });

        if (existingReceivers.length > 0) {
            const existingPhones = existingReceivers.map(receiver => receiver.phone);
            throw new AppError(`Receivers with phones [${existingPhones.join(", ")}] already exist`, 400);
        }

        const receivers = await ReceiverModel.insertMany(receiversData);

        return res.status(201).json({
            status: "success",
            data: { receivers },
        });
    } catch (error) {
        next(error);
    }
};

// Update a receiver
export const updateReceiver = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("Invalid receiver ID", 400);
        }

        // If attempting to update phone, check if it's unique
        if (updateData.phone) {
            const existingReceiver = await ReceiverModel.findOne({
                phone: updateData.phone,
                _id: { $ne: id },
            });

            if (existingReceiver) {
                throw new AppError(`Receiver with phone ${updateData.phone} already exists`, 400);
            }
        }

        const receiver = await ReceiverModel.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!receiver) {
            throw new AppError(`Receiver with ID ${id} not found`, 404);
        }

        return res.status(200).json({
            status: "success",
            data: { receiver },
        });
    } catch (error) {
        next(error);
    }
};

// Delete a receiver
export const deleteReceiver = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("Invalid receiver ID", 400);
        }

        const receiver = await ReceiverModel.findByIdAndDelete(id);

        if (!receiver) {
            throw new AppError(`Receiver with ID ${id} not found`, 404);
        }

        return res.status(200).json({
            status: "success",
            message: "Receiver deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};
