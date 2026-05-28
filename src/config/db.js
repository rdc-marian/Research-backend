const mongoose = require("mongoose");

const connectDB = async () => {
  const { MONGO_URI } = process.env;

  if (!MONGO_URI) {
    throw new Error("MONGO_URI is not set");
  }

  mongoose.set("strictQuery", true);

  try {
    const connection = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
    });

    const host = connection.connection.host || "unknown";
    console.log(`MongoDB Connected: ${host}`);
    return connection;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    if (error && error.stack) {
      console.error(error.stack);
    }
    throw error;
  }
};

module.exports = { connectDB };
