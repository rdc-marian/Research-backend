"use strict";

const { asyncHandler } = require("../utils/asyncHandler");

// Handle single file upload request and return file metadata
const handleUpload = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "file is required" });
    }
    const originalName = req.file.originalname;
    const mimeType = req.file.mimetype;
    const size = req.file.size;
    const filename = req.file.filename;
    const url = `/api/uploads/${filename}`;
    
    res.status(201).json({
        item: {
            url,
            publicId: filename,
            originalName,
            mimeType,
            size,
        },
    });
});

module.exports = {
    handleUpload,
};
