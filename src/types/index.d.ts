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
    totalCost: number;
    picture: string;
    date: Date;
}

export interface Receiver {
    name: string;
    phone: string;
    email: string;
    department: string;
}

export interface Gift {
    stockItemId: string;
    quantity: number;
    receiverId: string;
    date: Date;
}

export interface StockEntry {
    stockItemId: string;
    quantity: number;
    date: Date;
}

export interface ExtendedRequest extends Request {
    isAuthenticated?: boolean;
    user?: JwtPayload | { id: string; phone: string };
}
