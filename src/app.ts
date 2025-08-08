import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import swaggerUi from "swagger-ui-express";

import swaggerSpecs from "./config/swagger";
import errorHandler from "./middleware/errorHandler";
import imageUploadRoutes from "./routes/imageUploadRoutes";
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

// Swagger documentation
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpecs, {
        explorer: true,
        customCss: ".swagger-ui .topbar { display: none }",
        customSiteTitle: "Crown Gift Management API Documentation",
    })
);

// Serve raw swagger JSON
app.get("/swagger.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpecs);
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/stock-items", stockItemRoutes);
app.use("/api/stock-modifications", stockModificationRoutes);
app.use("/api/stock-issues", stockIssueRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/image-upload", imageUploadRoutes);

// Default route
app.get("/", (req, res) => {
    res.json({
        status: "success",
        message: "Crown Stock Issue Management API - Welcome!",
        documentation: {
            swagger_ui: "/api-docs",
            swagger_json: "/swagger.json",
        },
        version: "1.0.0",
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
