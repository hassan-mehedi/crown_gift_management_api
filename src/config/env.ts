import { str, num, cleanEnv } from "envalid";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const env = cleanEnv(process.env, {
    // Server configuration
    NODE_ENV: str({ choices: ["development", "test", "production"], default: "development" }),
    PORT: num({ default: 5000 }),

    // MongoDB connection
    MONGODB_URI: str({ desc: "MongoDB connection string" }),

    // JWT Secret for authentication
    JWT_SECRET: str({ desc: "JWT secret key", default: "your_jwt_secret_key_here" }),
});

export default env;
