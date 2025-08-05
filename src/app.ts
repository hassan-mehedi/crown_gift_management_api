import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import errorHandler from "./middleware/errorHandler";
import imageUploadRoutes from "./routes/imageUploadRoutes";
import receiverRoutes from "./routes/receiverRoutes";
import requestRoutes from "./routes/requestRoutes";
import stockIssueRoutes from "./routes/stockIssueRoutes";
import stockItemRoutes from "./routes/stockItemRoutes";
import stockModificationRoutes from "./routes/stockModificationRoutes";
import userRoutes from "./routes/userRoutes";
import vendorRoutes from "./routes/vendorRoutes";

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/stock-items", stockItemRoutes);
app.use("/api/stock-modifications", stockModificationRoutes);
app.use("/api/receivers", receiverRoutes);
app.use("/api/stock-issues", stockIssueRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/image-upload", imageUploadRoutes);

// Default route
app.get("/", (req, res) => {
    res.json({
        status: "success",
        message: "Crown Stock Issue Management API - Welcome!",
    });
});

// 404 route
app.use("*", (req, res) => {
    res.status(404).json({
        status: "error",
        message: "Route not found",
    });
});

// Global error handler
app.use(errorHandler);

export default app;
