import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes";
import stockItemRoutes from "./routes/stockItemRoutes";
import stockEntryRoutes from "./routes/stockEntryRoutes";
import receiverRoutes from "./routes/receiverRoutes";
import giftRoutes from "./routes/giftRoutes";
import vendorRoutes from "./routes/vendorRoutes";
import errorHandler from "./middleware/errorHandler";

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
app.use("/api/stock-entries", stockEntryRoutes);
app.use("/api/receivers", receiverRoutes);
app.use("/api/gifts", giftRoutes);
app.use("/api/vendors", vendorRoutes);

// Default route
app.get("/", (req, res) => {
    res.json({
        status: "success",
        message: "Crown Gift Management API - Welcome!",
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
