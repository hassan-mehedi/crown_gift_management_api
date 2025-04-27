import { Request, Response, NextFunction } from "express";
import UserModel from "../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import env from "../config/env";
import { removeSensitiveInfo } from "../utils/userUtils";
import AppError from "../utils/appError";

// Register a new user
export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userData = req.body;

        // Check if user with this phone already exists
        const existingUser = await UserModel.findOne({ phone: userData.phone });
        if (existingUser) {
            throw new AppError(`User with phone ${userData.phone} already exists`, 400);
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        userData.password = await bcrypt.hash(userData.password, salt);

        // Create the user
        const user = await UserModel.create(userData);

        // Generate JWT token
        const token = jwt.sign({ id: user._id, phone: user.phone }, env.JWT_SECRET, { expiresIn: "7d" });

        // Remove password from response using utility function
        const userResponse = removeSensitiveInfo(user.toObject());

        return res.status(201).json({
            status: "success",
            data: {
                user: userResponse,
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Login user
export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { phone, password } = req.body;

        // Find user by phone
        const user = await UserModel.findOne({ phone });
        if (!user) {
            throw new AppError("Invalid credentials", 401);
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new AppError("Invalid credentials", 401);
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id, phone: user.phone }, env.JWT_SECRET, { expiresIn: "7d" });

        // Remove password from response using utility function
        const userResponse = removeSensitiveInfo(user.toObject());

        return res.status(200).json({
            status: "success",
            data: {
                user: userResponse,
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get all users with pagination
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) ?? 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const users = await UserModel.find().select("-password").skip(skip).limit(limit);

        const totalUsers = await UserModel.countDocuments();
        const totalPages = Math.ceil(totalUsers / limit);

        return res.status(200).json({
            status: "success",
            data: {
                users,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: totalUsers,
                    itemsPerPage: limit,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get a single user by phone
export const getUserByPhone = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { phone } = req.params;
        const user = await UserModel.findOne({ phone }).select("-password");

        if (!user) {
            throw new AppError(`User with phone ${phone} not found`, 404);
        }

        return res.status(200).json({
            status: "success",
            data: { user },
        });
    } catch (error) {
        next(error);
    }
};

// Update a user by phone
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { phone } = req.params;
        const updateData = { ...req.body };

        // If password is included, hash it
        if (updateData.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        }

        const user = await UserModel.findOneAndUpdate({ phone }, updateData, {
            new: true,
            runValidators: true,
        }).select("-password");

        if (!user) {
            throw new AppError(`User with phone ${phone} not found`, 404);
        }

        return res.status(200).json({
            status: "success",
            message: "User updated successfully",
            data: { user },
        });
    } catch (error) {
        next(error);
    }
};

// Delete a user
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { phone } = req.params;

        const user = await UserModel.findOneAndDelete({ phone });

        if (!user) {
            throw new AppError(`User with phone ${phone} not found`, 404);
        }

        return res.status(200).json({
            status: "success",
            message: "User deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};
