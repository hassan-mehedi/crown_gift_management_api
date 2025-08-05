import mongoose, { Document, Schema } from "mongoose";

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
        unitCost: {
            type: Number,
            default: 0,
        },
        picture: {
            type: String,
        },
        vendorId: {
            type: String,
            required: true,
            ref: "Vendor",
        },
        workOrderNumber: {
            type: String,
        },
        images: {
            type: [String],
            default: [],
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

const StockItemModel = mongoose.model<StockItemDocument>("StockItem", stockItemSchema);

export default StockItemModel;
