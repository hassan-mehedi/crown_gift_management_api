import mongoose, { Schema, Document } from "mongoose";
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
    },
    {
        timestamps: true,
    }
);

const StockModificationModel = mongoose.model<StockModificationDocument>("StockModification", stockModificationSchema);

export default StockModificationModel;
