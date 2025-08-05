import mongoose, { Document, Schema } from "mongoose";

import { requestModel } from "../types";
import { ApprovalStatus } from "../enums";

export interface RequestDocument extends requestModel, Document {}

const requestSchema = new Schema<RequestDocument>(
    {
        stockItemId: {
            type: String,
            ref: "StockItem",
        },
        stockIssueId: {
            type: String,
            ref: "StockIssue",
        },
        stockModificationId: {
            type: String,
            ref: "StockModification",
        },
        status: {
            type: String,
            required: true,
            default: ApprovalStatus.PENDING,
            enum: Object.values(ApprovalStatus),
        },
        comment: {
            type: String,
            default: "",
        },
        createdBy: {
            type: String,
            required: true,
            ref: "User",
        },
        approvedBy: {
            type: String,
            ref: "User",
        },
        rejectedBy: {
            type: String,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

const RequestModel = mongoose.model<RequestDocument>("Request", requestSchema);

export default RequestModel;
