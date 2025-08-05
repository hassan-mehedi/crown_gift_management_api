import mongoose, { Document, Schema } from "mongoose";

import { StockModification } from "../types";

export interface StockModificationDocument extends StockModification, Document {}

const stockModificationSchema = new Schema<StockModificationDocument>(
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
        description: {
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

const StockModificationModel = mongoose.model<StockModificationDocument>("StockModification", stockModificationSchema);

export default StockModificationModel;
