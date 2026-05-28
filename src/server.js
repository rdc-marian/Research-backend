const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { app } = require("./app");
const { connectDB } = require("./config/db");
const { configureCloudinary } = require("./config/cloudinary");

const port = Number(process.env.PORT) || 5000;

const start = async () => {
  try {
    await connectDB();
    configureCloudinary();

    app.listen(port, () => {
      console.log(`API listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

start();
