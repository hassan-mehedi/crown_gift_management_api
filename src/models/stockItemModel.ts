import mongoose, { Schema, Document } from "mongoose";
import { StockItem } from "../types";

export interface StockItemDocument extends StockItem, Document {}

const stockItemSchema = new Schema<StockItemDocument>(
    {
        name: {
            type: String,
            required: true,
        },
        quantity: {
            type: Number,
            default: 0,
        },
        storage: {
            type: String,
        },
        totalCost: {
            type: Number,
            default: 0,
        },
        picture: {
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

const StockItemModel = mongoose.model<StockItemDocument>("StockItem", stockItemSchema);

export default StockItemModel;
