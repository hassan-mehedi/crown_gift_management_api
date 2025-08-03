import { Request, Response, NextFunction } from "express";
import { uploadMultipleFiles, listFiles, deleteMultipleFiles } from "../services/supabaseService";
import { UploadResponse } from "../types";
import AppError from "../utils/appError";

/**
 * Handle multiple image uploads
 */
export const uploadImages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
            return next(new AppError("No files provided", 400));
        }

        // Upload files to Supabase
        const uploadedFiles = await uploadMultipleFiles(files);

        const response: UploadResponse = {
            success: true,
            message: `Successfully uploaded ${uploadedFiles.length} file(s)`,
            data: {
                urls: uploadedFiles.map(file => file.url),
                paths: uploadedFiles.map(file => file.path),
            },
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("Upload error:", error);
        return next(new AppError("Upload failed", 500));
    }
};

/**
 * Get uploaded files list
 */
export const getFiles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { folder = "uploads", limit = 100, page = 1 } = req.query;

        const files = await listFiles(folder as string, parseInt(limit as string) || 100);

        res.status(200).json({
            success: true,
            message: "Files retrieved successfully",
            data: files,
        });
    } catch (error) {
        console.error("Error retrieving files:", error);
        return next(new AppError("Failed to retrieve files", 500));
    }
};

/**
 * Get a specific file by path
 */
export const getFileByPath = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { path } = req.params;

        // Here you would implement logic to get file details by path
        // For now, returning a placeholder response
        res.status(200).json({
            success: true,
            message: "File retrieved successfully",
            data: {
                path,
                // Add other file details as needed
            },
        });
    } catch (error) {
        console.error("Error retrieving file:", error);
        return next(new AppError("Failed to retrieve file", 500));
    }
};

/**
 * Delete files
 */
export const deleteFiles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { paths } = req.body;

        if (!paths || !Array.isArray(paths) || paths.length === 0) {
            return next(new AppError("No file paths provided", 400));
        }

        const result = await deleteMultipleFiles(paths);

        res.status(200).json({
            success: true,
            message: `Deleted ${result.success.length} files successfully`,
            data: result,
        });
    } catch (error) {
        console.error("Delete error:", error);
        return next(new AppError("Failed to delete files", 500));
    }
};
