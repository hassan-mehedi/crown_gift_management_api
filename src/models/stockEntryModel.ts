import mongoose, { Schema, Document } from "mongoose";
import { StockEntry } from "../types";

export interface StockEntryDocument extends StockEntry, Document {}

const stockEntrySchema = new Schema<StockEntryDocument>(
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
        date: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const StockEntryModel = mongoose.model<StockEntryDocument>("StockEntry", stockEntrySchema);

export default StockEntryModel;
