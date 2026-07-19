require("dotenv").config();
const { connectDB } = require("../src/config/db");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../src/models/User");
const SystemSettings = require("../src/models/SystemSettings");

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
    console.log("Re-creating administrative users and system settings...");
    
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    // Create Admin
    await User.create({
      name: "Admin",
      email: "admin@univ.edu",
      role: "admin",
      roles: ["admin"],
      password: hashedPassword,
      status: "Active",
    });

    // Create Coordinator
    await User.create({
      name: "test coordinator",
      email: "coordinator@univ.edu",
      role: "coordinator",
      roles: ["coordinator"],
      password: hashedPassword,
      status: "Active",
    });

    // Create Library
    await User.create({
      name: "test library",
      email: "library@univ.edu",
      role: "library",
      roles: ["library"],
      password: hashedPassword,
      status: "Active",
    });

    // Create Default SystemSettings
    await SystemSettings.create({
      systemName: "MarianResearch Portal",
      organization: "Marian College Kuttikkanam",
      timezone: "GMT+05:30",
      dateFormat: "dd/mm/yyyy",
    });

    console.log("Cleanup and administrative setup complete.");
    process.exit(0);
  } catch (error) {
    console.error("Failed to run database cleanup:", error);
    process.exit(1);
  }
};

run();
