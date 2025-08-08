import swaggerJsdoc from "swagger-jsdoc";
import { UserRole, ApprovalStatus } from "../enums";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Crown Gift Management API",
            version: "1.0.0",
            description: "This is a backend API for managing crown stock issue management system",
            contact: {
                name: "Mehedi Hassan",
                email: "mehedi@example.com",
            },
        },
        servers: [
            {
                url: process.env.NODE_ENV === "production" ? "https://crown-gift-management-api.denom.cc" : "http://localhost:5000",
                description: process.env.NODE_ENV === "production" ? "Production server" : "Development server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                User: {
                    type: "object",
                    required: ["name", "phone", "password"],
                    properties: {
                        _id: {
                            type: "string",
                            description: "User ID",
                        },
                        name: {
                            type: "string",
                            minLength: 3,
                            description: "User full name",
                        },
                        email: {
                            type: "string",
                            format: "email",
                            description: "User email address",
                        },
                        department: {
                            type: "string",
                            description: "User department",
                        },
                        phone: {
                            type: "string",
                            minLength: 10,
                            description: "User phone number",
                        },
                        password: {
                            type: "string",
                            minLength: 8,
                            description: "User password",
                        },
                        designation: {
                            type: "string",
                            description: "User designation",
                        },
                        role: {
                            type: "string",
                            enum: Object.values(UserRole),
                            default: UserRole.RECEIVER,
                            description: "User role in the system",
                        },
                    },
                },
                UserResponse: {
                    type: "object",
                    properties: {
                        _id: {
                            type: "string",
                            description: "User ID",
                        },
                        name: {
                            type: "string",
                            description: "User full name",
                        },
                        email: {
                            type: "string",
                            description: "User email address",
                        },
                        department: {
                            type: "string",
                            description: "User department",
                        },
                        phone: {
                            type: "string",
                            description: "User phone number",
                        },
                        designation: {
                            type: "string",
                            description: "User designation",
                        },
                        role: {
                            type: "string",
                            enum: Object.values(UserRole),
                            description: "User role in the system",
                        },
                    },
                },
                LoginRequest: {
                    type: "object",
                    required: ["phone", "password"],
                    properties: {
                        phone: {
                            type: "string",
                            minLength: 10,
                            description: "User phone number",
                        },
                        password: {
                            type: "string",
                            minLength: 8,
                            description: "User password",
                        },
                    },
                },
                LoginResponse: {
                    type: "object",
                    properties: {
                        status: {
                            type: "string",
                            example: "success",
                        },
                        message: {
                            type: "string",
                            example: "Login successful",
                        },
                        data: {
                            type: "object",
                            properties: {
                                user: {
                                    $ref: "#/components/schemas/UserResponse",
                                },
                                token: {
                                    type: "string",
                                    description: "JWT token",
                                },
                            },
                        },
                    },
                },
                StockItem: {
                    type: "object",
                    required: ["name", "description", "quantity"],
                    properties: {
                        _id: {
                            type: "string",
                            description: "Stock item ID",
                        },
                        name: {
                            type: "string",
                            description: "Stock item name",
                        },
                        description: {
                            type: "string",
                            description: "Stock item description",
                        },
                        quantity: {
                            type: "number",
                            minimum: 0,
                            description: "Available quantity",
                        },
                        category: {
                            type: "string",
                            description: "Item category",
                        },
                        unit: {
                            type: "string",
                            description: "Unit of measurement",
                        },
                    },
                },
                StockIssue: {
                    type: "object",
                    required: ["stockItemId", "receiverId", "quantity"],
                    properties: {
                        _id: {
                            type: "string",
                            description: "Stock issue ID",
                        },
                        stockItemId: {
                            type: "string",
                            description: "Reference to stock item",
                        },
                        receiverId: {
                            type: "string",
                            description: "Reference to receiver user",
                        },
                        quantity: {
                            type: "number",
                            minimum: 1,
                            description: "Quantity to issue",
                        },
                        issuedDate: {
                            type: "string",
                            format: "date-time",
                            description: "Issue date",
                        },
                        notes: {
                            type: "string",
                            description: "Additional notes",
                        },
                    },
                },
                StockModification: {
                    type: "object",
                    required: ["stockItemId", "quantityChange", "reason"],
                    properties: {
                        _id: {
                            type: "string",
                            description: "Stock modification ID",
                        },
                        stockItemId: {
                            type: "string",
                            description: "Reference to stock item",
                        },
                        quantityChange: {
                            type: "number",
                            description: "Quantity change (positive for addition, negative for reduction)",
                        },
                        reason: {
                            type: "string",
                            description: "Reason for modification",
                        },
                        modifiedDate: {
                            type: "string",
                            format: "date-time",
                            description: "Modification date",
                        },
                        modifiedBy: {
                            type: "string",
                            description: "User who made the modification",
                        },
                    },
                },
                Vendor: {
                    type: "object",
                    required: ["name", "contactInfo"],
                    properties: {
                        _id: {
                            type: "string",
                            description: "Vendor ID",
                        },
                        name: {
                            type: "string",
                            description: "Vendor name",
                        },
                        contactInfo: {
                            type: "string",
                            description: "Vendor contact information",
                        },
                        address: {
                            type: "string",
                            description: "Vendor address",
                        },
                        email: {
                            type: "string",
                            format: "email",
                            description: "Vendor email",
                        },
                    },
                },
                Request: {
                    type: "object",
                    required: ["requesterId", "stockItemId", "quantity"],
                    properties: {
                        _id: {
                            type: "string",
                            description: "Request ID",
                        },
                        requesterId: {
                            type: "string",
                            description: "Reference to requester user",
                        },
                        stockItemId: {
                            type: "string",
                            description: "Reference to requested stock item",
                        },
                        quantity: {
                            type: "number",
                            minimum: 1,
                            description: "Requested quantity",
                        },
                        status: {
                            type: "string",
                            enum: Object.values(ApprovalStatus),
                            default: ApprovalStatus.PENDING,
                            description: "Request approval status",
                        },
                        requestDate: {
                            type: "string",
                            format: "date-time",
                            description: "Request date",
                        },
                        approvedBy: {
                            type: "string",
                            description: "Reference to approver user",
                        },
                        notes: {
                            type: "string",
                            description: "Additional notes",
                        },
                    },
                },
                SuccessResponse: {
                    type: "object",
                    properties: {
                        status: {
                            type: "string",
                            example: "success",
                        },
                        message: {
                            type: "string",
                        },
                        data: {
                            type: "object",
                        },
                    },
                },
                ErrorResponse: {
                    type: "object",
                    properties: {
                        status: {
                            type: "string",
                            example: "error",
                        },
                        message: {
                            type: "string",
                        },
                        error: {
                            type: "object",
                        },
                    },
                },
                PaginationQuery: {
                    type: "object",
                    properties: {
                        page: {
                            type: "integer",
                            minimum: 1,
                            default: 1,
                            description: "Page number",
                        },
                        limit: {
                            type: "integer",
                            minimum: 1,
                            maximum: 100,
                            default: 10,
                            description: "Number of items per page",
                        },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ["./src/routes/*.ts", "./src/controllers/*.ts"], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);
export default specs;
