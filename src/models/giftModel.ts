import mongoose, { Schema, Document } from "mongoose";
import { Gift } from "../types";

export interface GiftDocument extends Gift, Document {}

const giftSchema = new Schema<GiftDocument>(
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

const GiftModel = mongoose.model<GiftDocument>("Gift", giftSchema);

export default GiftModel;
