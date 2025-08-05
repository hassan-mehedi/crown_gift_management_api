import mongoose, { Document, Schema } from "mongoose";

import { StockIssue } from "../types";

export interface StockIssueDocument extends StockIssue, Document {}

const stockIssueSchema = new Schema<StockIssueDocument>(
    {
        stockItemId: {
            type: String,
            required: true,
            ref: "StockItem",
        },
        quantity: {
            type: Number,
            default: 0,
        },
        receiverId: {
            type: String,
            required: true,
            ref: "Receiver",
        },
        status: {
            type: String,
        },
        comment: {
            type: String,
        },
        date: {
            type: Date,
            required: true,
        },
        createdBy: {
            type: String,
            required: true,
            ref: "User",
        },
        isApproved: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const StockIssueModel = mongoose.model<StockIssueDocument>("StockIssue", stockIssueSchema);

export default StockIssueModel;
