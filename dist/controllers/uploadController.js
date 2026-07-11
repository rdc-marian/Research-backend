"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { asyncHandler } = require("../utils/asyncHandler");
// Handle single file upload request and return file metadata
const handleUpload = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "file is required" });
    }
    // For MVP, store file details in memory and return structured file metadata
    const originalName = req.file.originalname;
    const mimeType = req.file.mimetype;
    const size = req.file.size;
    const timestamp = Date.now();
    const fileKey = `${timestamp}-${originalName}`;
    const url = `/api/uploads/${fileKey}`;
    res.status(201).json({
        item: {
            url,
            publicId: fileKey,
            originalName,
            mimeType,
            size,
        },
    });
});
module.exports = {
    handleUpload,
};
