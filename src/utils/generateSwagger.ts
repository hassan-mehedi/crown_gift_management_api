import fs from "fs";
import path from "path";
import swaggerSpecs from "../config/swagger";

// Create swagger.json file
const swaggerJsonPath = path.join(__dirname, "../..", "swagger.json");

try {
    fs.writeFileSync(swaggerJsonPath, JSON.stringify(swaggerSpecs, null, 2));
    console.log("✅ swagger.json generated successfully at:", swaggerJsonPath);
} catch (error) {
    console.error("❌ Error generating swagger.json:", error);
}
