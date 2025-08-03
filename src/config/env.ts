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

    // Supabase configuration
    SUPABASE_URL: str({ desc: "Supabase project URL" }),
    SUPABASE_ANON_KEY: str({ desc: "Supabase anonymous key", default: "" }),
    SUPABASE_SERVICE_ROLE_KEY: str({ desc: "Supabase service role key" }),
});

export default env;
