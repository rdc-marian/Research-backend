require("dotenv").config();
const { connectDB } = require("../src/config/db");
const mongoose = require("mongoose");

const run = async () => {
  try {
    await connectDB();
    console.log("Cleaning database collections...");
    
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany();
    }
    
    console.log("Database cleared successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Database clear failed:", error);
    process.exit(1);
  }
};

run();
