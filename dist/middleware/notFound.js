"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Middleware to handle requests for non-existent routes (404 errors)
const notFound = (req, res, next) => {
    res.status(404).json({
        message: `API Route Not Found - ${req.method} ${req.originalUrl}`,
    });
};
module.exports = { notFound };
