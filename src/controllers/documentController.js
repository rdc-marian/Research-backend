"use strict";

const Document = require("../models/Document");
const GoogleDriveService = require("../services/GoogleDriveService");
const { asyncHandler } = require("../utils/asyncHandler");

const driveService = new GoogleDriveService();

// Allowed file types
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
];

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Handle document upload, Google Drive storage integration, metadata storage, and rollback logic.
 */
const uploadDocument = asyncHandler(async (req, res) => {
  const { title, category } = req.body;
  const file = req.file;

  // 1. Validate request body metadata
  if (!title || !title.trim()) {
    return res.status(400).json({ message: "Document title is required" });
  }

  if (!category || !category.trim()) {
    return res.status(400).json({ message: "Document category is required" });
  }

  // 2. Validate uploaded file existence
  if (!file) {
    return res.status(400).json({ message: "No file was uploaded" });
  }

  // 3. Validate file size and mime types
  if (file.size > MAX_FILE_SIZE) {
    return res.status(400).json({
      message: `File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    });
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return res.status(400).json({
      message: "Unsupported file type. Only PDF, Word, Excel, and Images (JPEG, PNG, GIF) are allowed.",
    });
  }

  let folderId;
  try {
    // 4. Determine destination folder based on the category name
    // Retrieves folder ID matching the category or creates it if not found
    const targetFolder = await driveService.getOrCreateFolder(category.trim());
    folderId = targetFolder.id;
  } catch (error) {
    return res.status(500).json({
      message: `Failed to retrieve or create target folder in Google Drive: ${error.message}`,
    });
  }

  let uploadResult;
  try {
    // 5. Upload document stream directly to Google Drive
    uploadResult = await driveService.uploadFile(file, {
      folderId,
      filename: file.originalname,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Google Drive file upload failed: ${error.message}`,
    });
  }

  // 6. Save document metadata to MongoDB with rollback protection
  try {
    const documentMetadata = new Document({
      title: title.trim(),
      category: category.trim(),
      uploadedBy: req.user.userId,
      driveFileId: uploadResult.id,
      driveFolderId: folderId,
      mimeType: file.mimetype,
      fileSize: file.size,
      originalFileName: file.originalname,
      storageProvider: "google-drive",
    });

    const savedDoc = await documentMetadata.save();

    // 7. Generate viewable file URL from Drive service
    let fileUrl = uploadResult.webViewLink;
    try {
      fileUrl = await driveService.getFileUrl(uploadResult.id);
    } catch (urlError) {
      console.warn("Failed to generate public URL, using default webViewLink:", urlError.message);
    }

    // 8. Return formatted success response
    return res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      data: {
        id: savedDoc._id,
        title: savedDoc.title,
        category: savedDoc.category,
        driveFileId: savedDoc.driveFileId,
        fileUrl,
        uploadedBy: savedDoc.uploadedBy,
        createdAt: savedDoc.createdAt,
      },
    });
  } catch (mongoError) {
    // Rollback: delete file from Google Drive to ensure storage and database consistency
    if (uploadResult && uploadResult.id) {
      try {
        await driveService.deleteFile(uploadResult.id);
      } catch (deleteError) {
        console.error(
          `Rollback failed: Could not delete uploaded Google Drive file with ID: ${uploadResult.id}. Error:`,
          deleteError
        );
      }
    }

    return res.status(500).json({
      message: `Database registration failed. Rolled back uploaded file: ${mongoError.message}`,
    });
  }
});

module.exports = {
  uploadDocument,
};
