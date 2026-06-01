const path = require("path");
console.log("Server starting...");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
console.log("MONGO_URI exists:", Boolean(process.env.MONGO_URI));
console.log("FRONTEND_ORIGIN exists:", Boolean(process.env.FRONTEND_ORIGIN));
process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);
const { app } = require("./app");
const { connectDB } = require("./config/db");
const { configureS3 } = require("./config/s3");

const port = Number(process.env.PORT) || 5000;

const start = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await connectDB();
    console.log("MongoDB connected.");
    configureS3();

    console.log("Starting HTTP server...");
    app.listen(port, () => {
      console.log(`API listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.stack || error);
    process.exit(1);
  }
};

start();
