import { NextFunction, Response } from "express";
import mongoose from "mongoose";

import { ApprovalStatus, UserRole } from "../enums";
import RequestModel from "../models/requestModel";
import StockIssueModel from "../models/stockIssueModel";
import StockItemModel from "../models/stockItemModel";
import StockModificationModel from "../models/stockModificationModel";
import { ExtendedRequest } from "../types";
import AppError from "../utils/appError";

// Get all requests with optional status filter and pagination
export const getAllRequests = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 100;
        const skip = (page - 1) * limit;
        const status = req.query.status as string;

        // Build filter object
        const filter: any = {};

        if (status) {
            filter.status = status;
        }

        // If user is not admin, filter by createdBy
        if (req.user?.role !== UserRole.ADMIN) {
            filter.createdBy = req.user?.id;
        }

        const requests = await RequestModel.find(filter)
            .populate({
                path: "stockItemId",
                populate: {
                    path: "vendorId",
                },
            })
            .populate({
                path: "stockIssueId",
                populate: [
                    {
                        path: "stockItemId",
                        populate: {
                            path: "vendorId",
                        },
                    },
                    {
                        path: "receiverId",
                    },
                ],
            })
            .populate({
                path: "stockModificationId",
                populate: {
                    path: "stockItemId",
                    populate: {
                        path: "vendorId",
                    },
                },
            })
            .populate("createdBy", "name email department designation")
            .populate("approvedBy", "name email department designation")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalRequests = await RequestModel.countDocuments(filter);
        const totalPages = Math.ceil(totalRequests / limit);

        return res.status(200).json({
            status: "success",
            data: {
                requests,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: totalRequests,
                    itemsPerPage: limit,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get a single request by ID
export const getRequestById = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new AppError("Invalid request ID", 400));
        }

        const request = await RequestModel.findById(id)
            .populate({
                path: "stockItemId",
                populate: {
                    path: "vendorId",
                },
            })
            .populate({
                path: "stockIssueId",
                populate: [
                    {
                        path: "stockItemId",
                        populate: {
                            path: "vendorId",
                        },
                    },
                    {
                        path: "receiverId",
                    },
                ],
            })
            .populate({
                path: "stockModificationId",
                populate: {
                    path: "stockItemId",
                    populate: {
                        path: "vendorId",
                    },
                },
            })
            .populate("createdBy", "name email department designation")
            .populate("approvedBy", "name email department designation");

        if (!request) {
            return next(new AppError("Request not found", 404));
        }

        return res.status(200).json({
            status: "success",
            data: { request },
        });
    } catch (error) {
        next(error);
    }
};

// Update a request (status and comment only, Admin role required)
export const updateRequest = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { status, comment } = req.body;

        // Check if user is admin
        if (req.user?.role !== UserRole.ADMIN) {
            return next(new AppError("Only admins can update requests", 403));
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new AppError("Invalid request ID", 400));
        }

        const existingRequest = await RequestModel.findById(id);
        if (!existingRequest) {
            return next(new AppError("Request not found", 404));
        }

        // Prepare update data (only allow status and comment updates)
        const updateData: any = {};

        if (status !== undefined) {
            updateData.status = status;
        }
        if (comment !== undefined) {
            updateData.comment = comment;
        }
        if (status === ApprovalStatus.APPROVED) {
            updateData.approvedBy = req.user?.id;
        }
        if (status === ApprovalStatus.REJECTED) {
            updateData.rejectedBy = req.user?.id;
        }

        // Handle approval/rejection logic
        if (status === ApprovalStatus.APPROVED) {
            await handleRequestApproval(existingRequest);
        } else if (status === ApprovalStatus.REJECTED) {
            await handleRequestRejection(existingRequest);
        }

        const updatedRequest = await RequestModel.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        })
            .populate({
                path: "stockItemId",
                populate: {
                    path: "vendorId",
                },
            })
            .populate({
                path: "stockIssueId",
                populate: [
                    {
                        path: "stockItemId",
                        populate: {
                            path: "vendorId",
                        },
                    },
                    {
                        path: "receiverId",
                    },
                ],
            })
            .populate({
                path: "stockModificationId",
                populate: {
                    path: "stockItemId",
                    populate: {
                        path: "vendorId",
                    },
                },
            })
            .populate("createdBy", "name email department designation")
            .populate("approvedBy", "name email department designation");

        return res.status(200).json({
            status: "success",
            data: { request: updatedRequest },
        });
    } catch (error) {
        next(error);
    }
};

// Helper function to handle request approval
const handleRequestApproval = async (request: any) => {
    if (request.stockItemId) {
        await StockItemModel.findByIdAndUpdate(request.stockItemId, { isApproved: true });
    }

    if (request.stockIssueId) {
        await StockIssueModel.findByIdAndUpdate(request.stockIssueId, { isApproved: true });
    }

    if (request.stockModificationId) {
        await StockModificationModel.findByIdAndUpdate(request.stockModificationId, { isApproved: true });
    }
};

// Helper function to handle request rejection
const handleRequestRejection = async (request: any) => {
    if (request.stockItemId) {
        await StockItemModel.findByIdAndDelete(request.stockItemId);
    }

    if (request.stockIssueId) {
        await StockIssueModel.findByIdAndDelete(request.stockIssueId);
    }

    if (request.stockModificationId) {
        await StockModificationModel.findByIdAndDelete(request.stockModificationId);
    }
};
