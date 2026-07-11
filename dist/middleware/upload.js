"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const multer = require("multer");
// Configure multer memory storage for file uploads
const storage = multer.memoryStorage();
// Set file upload configurations
const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
});
module.exports = { upload };
