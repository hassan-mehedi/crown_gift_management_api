import mongoose, { Schema, Document } from "mongoose";
import { Vendor } from "../types";

export interface VendorDocument extends Vendor, Document {}

const vendorSchema = new Schema<VendorDocument>(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
        },
        phone: {
            type: String,
            required: true,
            unique: true,
        },
        contactPersonName: {
            type: String,
            default: "",
        },
        address: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

const VendorModel = mongoose.model<VendorDocument>("Vendor", vendorSchema);

export default VendorModel;
