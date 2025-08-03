import { supabase } from "../providers/supabase";
import { UploadedFile } from "../types";

const DEFAULT_BUCKET_NAME = "images";

/**
 * Upload a single file to Supabase Storage
 */
export async function uploadSingleFile(file: Express.Multer.File, bucketName: string = DEFAULT_BUCKET_NAME): Promise<UploadedFile> {
    try {
        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExtension = file.originalname.split(".").pop();
        const fileName = `${timestamp}_${randomString}.${fileExtension}`;
        const filePath = `uploads/${fileName}`;

        // Upload file to Supabase Storage
        const { data, error } = await supabase.storage.from(bucketName).upload(filePath, file.buffer, {
            contentType: file.mimetype,
            duplex: "half",
        });

        if (error) {
            throw new Error(`Upload failed: ${error.message}`);
        }

        // Get public URL
        const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);

        return {
            originalName: file.originalname,
            fileName,
            path: data.path,
            url: urlData.publicUrl,
            size: file.size,
            mimetype: file.mimetype,
        };
    } catch (error) {
        throw new Error(`Failed to upload ${file.originalname}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}

/**
 * Upload multiple files to Supabase Storage
 */
export async function uploadMultipleFiles(files: Express.Multer.File[], bucketName: string = DEFAULT_BUCKET_NAME): Promise<UploadedFile[]> {
    const uploadPromises = files.map(file => uploadSingleFile(file, bucketName));
    return Promise.all(uploadPromises);
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(filePath: string, bucketName: string = DEFAULT_BUCKET_NAME): Promise<boolean> {
    try {
        const { error } = await supabase.storage.from(bucketName).remove([filePath]);

        if (error) {
            throw new Error(`Delete failed: ${error.message}`);
        }

        return true;
    } catch (error) {
        console.error("Error deleting file:", error);
        return false;
    }
}

/**
 * Delete multiple files from Supabase Storage
 */
export async function deleteMultipleFiles(
    filePaths: string[],
    bucketName: string = DEFAULT_BUCKET_NAME
): Promise<{ success: string[]; failed: string[] }> {
    const results = await Promise.allSettled(filePaths.map(path => deleteFile(path, bucketName)));

    const success: string[] = [];
    const failed: string[] = [];

    results.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value) {
            success.push(filePaths[index]);
        } else {
            failed.push(filePaths[index]);
        }
    });

    return { success, failed };
}

/**
 * List all files in the bucket
 */
export async function listFiles(folder: string = "uploads", limit: number = 100, bucketName: string = DEFAULT_BUCKET_NAME) {
    try {
        const { data, error } = await supabase.storage.from(bucketName).list(folder, {
            limit,
            sortBy: { column: "created_at", order: "desc" },
        });

        if (error) {
            throw new Error(`Failed to list files: ${error.message}`);
        }

        return data;
    } catch (error) {
        console.error("Error listing files:", error);
        return [];
    }
}
