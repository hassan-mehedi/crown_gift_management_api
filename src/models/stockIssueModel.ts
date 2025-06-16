import mongoose, { Schema, Document } from "mongoose";
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
        approvalStatus: {
            type: String,
        },
        date: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const StockIssueModel = mongoose.model<StockIssueDocument>("StockIssue", stockIssueSchema);

export default StockIssueModel;
