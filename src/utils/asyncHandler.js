"use strict";

// Middleware wrapper to eliminate the need for try-catch blocks in every async controller function
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
module.exports = { asyncHandler };
