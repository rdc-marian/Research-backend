/**
 * @file googleDriveUpload.js
 * @description Upload utility wrapper for Google Drive storage to migrate from S3 cleanly.
 */

const GoogleDriveService = require("../services/GoogleDriveService");
const driveService = new GoogleDriveService();

/**
 * Checks if Google Drive is configured.
 * Always returns true since it uses fallback credentials.
 * @returns {boolean}
 */
const isGoogleDriveConfigured = () => {
  return true;
};

/**
 * Uploads a buffer directly to Google Drive under a specific folder.
 * @param {Buffer} buffer - The file buffer
 * @param {Object} options - Options containing folder, originalName, and contentType
 * @returns {Promise<Object>} Object containing file key (ID) and URL
 */
const uploadBuffer = async (buffer, options = {}) => {
  const folderName = options.folder || "uploads";
  
  // Retrieve or create category folder
  const folderResult = await driveService.getOrCreateFolder(folderName);
  
  const fileObj = {
    buffer,
    originalname: options.originalName || "file",
    mimetype: options.contentType || "application/octet-stream",
  };

  const uploadResult = await driveService.uploadFile(fileObj, {
    folderId: folderResult.id,
    filename: fileObj.originalname,
  });

  const fileUrl = await driveService.getFileUrl(uploadResult.id);

  return {
    key: uploadResult.id,
    url: fileUrl,
  };
};

module.exports = {
  isS3Configured: isGoogleDriveConfigured, // Export alias for compatibility
  uploadBuffer,
};
