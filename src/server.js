"use strict";

const path = require("path");
console.log("Initializing Research Marian Portal API Server...");
// Load environment variables from parent directory's .env file
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { app } = require("./app");
const { connectDB } = require("./config/db");
// Retrieve port from env or default to 5000
const PORT = Number(process.env.PORT) || 5000;
// Setup uncaught error logging
process.on("uncaughtException", (err) => {
    console.error("CRITICAL: Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason, promise) => {
    console.error("CRITICAL: Unhandled Rejection at:", promise, "reason:", reason);
});
// Main startup function
const startServer = async () => {
    try {
        console.log("Connecting to Database...");
        await connectDB();
        console.log("Starting HTTP server...");
        app.listen(PORT, () => {
            console.log(`API Server is listening on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
        });
    }
    catch (error) {
        console.error("Failed to start the server:", error);
        process.exit(1);
    }
};
startServer();
