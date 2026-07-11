"use strict";

// Global Express error handler middleware
const errorHandler = (err, req, res, next) => {
    console.error("Error occurred:", err);
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || "An unexpected server error occurred";
    res.status(statusCode).json({
        message,
        // Include stack trace only in development environment
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
};
module.exports = { errorHandler };
