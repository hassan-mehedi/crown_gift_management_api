import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";

export interface User {
    name: string;
    email: string;
    department: string;
    phone: string;
    password: string;
    designation: string;
}

export interface StockItem {
    name: string;
    quantity: number;
    storage: string;
    unitCost: number;
    picture: string;
    vendorId: string;
    workOrderNumber: string;
    images: string[];
    date: Date;
}

export interface Receiver {
    name: string;
    phone: string;
    email: string;
    department: string;
    description?: string;
}

export interface StockIssue {
    stockItemId: string;
    quantity: number;
    receiverId: string;
    status: string;
    comment: string;
    approvalStatus: string;
    date: Date;
}

export interface StockModification {
    stockItemId: string;
    quantity: number;
    description?: string;
    date: Date;
}

export interface Vendor {
    name: string;
    email: string;
    phone: string;
    contactPersonName: string;
    address: string;
}

export interface ExtendedRequest extends Request {
    isAuthenticated?: boolean;
    user?: JwtPayload | { id: string; phone: string };
}
