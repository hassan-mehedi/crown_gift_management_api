import mongoose, { Schema, Document } from "mongoose";
import { Receiver } from "../types";

export interface ReceiverDocument extends Receiver, Document {}

const receiverSchema = new Schema<ReceiverDocument>(
    {
        name: {
            type: String,
        },
        phone: {
            type: String,
            required: true,
        },
        email: {
            type: String,
        },
        department: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const ReceiverModel = mongoose.model<ReceiverDocument>("Receiver", receiverSchema);

export default ReceiverModel;
