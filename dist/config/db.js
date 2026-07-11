const mongoose = require("mongoose");
// Function to connect to the MongoDB database
const connectDB = async () => {
    const { MONGO_URI } = process.env;
    if (!MONGO_URI) {
        throw new Error("MONGO_URI is not set in environment variables");
    }
    // Set strictQuery to suppress Mongoose 7/8 warnings
    mongoose.set("strictQuery", true);
    try {
        const connection = await mongoose.connect(MONGO_URI);
        console.log(`MongoDB Connected: ${connection.connection.host}`);
        return connection;
    }
    catch (error) {
        console.error("MongoDB connection error:", error.message);
        process.exit(1); // Exit process with failure
    }
};
module.exports = { connectDB };
