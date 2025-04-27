import mongoose, { Schema, Document } from "mongoose";
import { User } from "../types";

export interface UserDocument extends User, Document {}

const userSchema = new Schema<UserDocument>(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
        },
        department: {
            type: String,
        },
        phone: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        designation: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const UserModel = mongoose.model<UserDocument>("User", userSchema);

export default UserModel;
