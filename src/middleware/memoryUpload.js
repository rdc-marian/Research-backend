/**
 * @file memoryUpload.js
 * @description Configures Multer to use memory storage instead of disk storage.
 * Uploaded files will be stored in buffers in memory, allowing them to be streamed
 * directly to Google Drive or other remote storage services.
 */

const multer = require("multer");

// Configure memory storage
const storage = multer.memoryStorage();

// Set file upload configurations with memory storage
const memoryUpload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB limit
  },
});

module.exports = { memoryUpload };
