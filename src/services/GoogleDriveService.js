/**
 * @file GoogleDriveService.js
 * @description GoogleDriveService implementation of the StorageService abstraction.
 * Integrates with Google Drive API v3 to upload, download, delete, and manage files and folders.
 */

const { Readable } = require("stream");
const StorageService = require("./StorageService");
const { getGoogleDriveClient } = require("../config/googleDrive");
const {
  StorageError,
  StorageAuthError,
  StoragePermissionError,
  StorageNotFoundError,
  StorageRateLimitError,
  StorageUploadError,
} = require("./StorageErrors");

/**
 * Maps error status codes from Google Drive API to specific Storage Errors.
 * @param {Error} error - The caught API error
 * @param {string} prefix - Context-specific error prefix
 * @throws {StorageError} Concrete mapped error class
 */
const handleDriveError = (error, prefix = "Google Drive operation failed") => {
  const status = error.status || error.code || 500;
  const msg = `${prefix}: ${error.message}`;

  if (status === 401) {
    throw new StorageAuthError(msg, error);
  } else if (status === 403) {
    throw new StoragePermissionError(msg, error);
  } else if (status === 404) {
    throw new StorageNotFoundError(msg, error);
  } else if (status === 429) {
    throw new StorageRateLimitError(msg, error);
  } else {
    throw new StorageError(msg, status, error);
  }
};

class GoogleDriveService extends StorageService {
  constructor() {
    super();
  }

  /**
   * Retrieves the current Google Drive root folder ID dynamically at runtime.
   * Prevents undefined errors during early module import loading.
   * @returns {string} The root folder ID
   */
  getRootFolderId() {
    return process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
  }

  /**
   * Uploads a file buffer or stream directly to Google Drive.
   * @param {Object} file - File object containing originalname, mimetype, buffer, or stream
   * @param {Object} [options] - Additional options (e.g. folderId, filename)
   * @returns {Promise<Object>} Object details of uploaded file
   */
  async uploadFile(file, options = {}) {
    try {
      const drive = getGoogleDriveClient();
      const parentId = options.folderId || this.getRootFolderId();
      const fileName = options.filename || file.originalname || "unnamed_file";

      // Log the parent folder ID for debugging
      console.log(`Google Drive Uploading File: '${fileName}' to Parent Folder ID: '${parentId}'`);

      if (!parentId) {
        throw new StorageUploadError("Google Drive upload target folder ID is undefined. Check environment variables.");
      }

      let mediaBody;
      if (file.buffer) {
        mediaBody = Readable.from(file.buffer);
      } else if (file.stream) {
        mediaBody = file.stream;
      } else {
        throw new StorageUploadError("Invalid file object: buffer or stream required");
      }

      const media = {
        mimeType: file.mimetype || "application/octet-stream",
        body: mediaBody,
      };

      const fileMetadata = {
        name: fileName,
        parents: [parentId],
      };

      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id, name, mimeType, webViewLink, webContentLink, size",
        supportsAllDrives: true, // Allow uploading to shared folders/drives
      });

      return {
        id: response.data.id,
        name: response.data.name,
        mimeType: response.data.mimeType,
        webViewLink: response.data.webViewLink,
        webContentLink: response.data.webContentLink,
        size: response.data.size,
      };
    } catch (error) {
      handleDriveError(error, "Upload failed");
    }
  }

  /**
   * Deletes a file from Google Drive by ID.
   * @param {string} fileId - The file ID
   * @returns {Promise<boolean>} True if successful
   */
  async deleteFile(fileId, options = {}) {
    try {
      const drive = getGoogleDriveClient();
      await drive.files.delete({
        fileId,
        supportsAllDrives: true,
      });
      return true;
    } catch (error) {
      handleDriveError(error, `Failed to delete file with ID: ${fileId}`);
    }
  }

  /**
   * Downloads a file from Google Drive as a Readable Stream.
   * @param {string} fileId - The file ID
   * @returns {Promise<ReadableStream>} A readable stream of file contents
   */
  async downloadFile(fileId, options = {}) {
    try {
      const drive = getGoogleDriveClient();
      const response = await drive.files.get(
        {
          fileId,
          alt: "media",
          supportsAllDrives: true,
        },
        { responseType: "stream" }
      );
      return response.data;
    } catch (error) {
      handleDriveError(error, `Failed to download file with ID: ${fileId}`);
    }
  }

  /**
   * Retrieves file metadata from Google Drive.
   * @param {string} fileId - The file ID
   * @returns {Promise<Object>} File metadata object
   */
  async getFile(fileId, options = {}) {
    try {
      const drive = getGoogleDriveClient();
      const response = await drive.files.get({
        fileId,
        fields: "id, name, mimeType, parents, size, createdTime, webViewLink, webContentLink",
        supportsAllDrives: true,
      });
      return response.data;
    } catch (error) {
      handleDriveError(error, `Failed to retrieve metadata for file with ID: ${fileId}`);
    }
  }

  /**
   * Updates file permissions to make it public and returns the webViewLink.
   * @param {string} fileId - The file ID
   * @param {Object} [options] - Additional options
   * @returns {Promise<string>} Publicly viewable webViewLink
   */
  async getFileUrl(fileId, options = {}) {
    try {
      const drive = getGoogleDriveClient();
      // Grant public read permission if public flag is set or by default
      if (options.makePublic !== false) {
        await drive.permissions.create({
          fileId,
          requestBody: {
            role: "reader",
            type: "anyone",
          },
          supportsAllDrives: true,
        });
      }

      const response = await drive.files.get({
        fileId,
        fields: "webViewLink",
        supportsAllDrives: true,
      });

      return response.data.webViewLink;
    } catch (error) {
      handleDriveError(error, `Failed to generate URL for file with ID: ${fileId}`);
    }
  }

  /**
   * Helper utility to create a new folder under a parent folder.
   * @param {string} folderName - Name of the new folder
   * @param {string} [parentFolderId] - Optional parent folder ID (defaults to root)
   * @param {Object} [options] - Additional options
   * @returns {Promise<Object>} The created folder metadata
   */
  async createFolder(folderName, parentFolderId = null, options = {}) {
    try {
      const drive = getGoogleDriveClient();
      const parentId = parentFolderId || this.getRootFolderId();

      console.log(`Google Drive Creating Folder: '${folderName}' under Parent Folder ID: '${parentId}'`);

      if (!parentId) {
        throw new StorageUploadError("Google Drive parent folder ID is undefined. Check environment variables.");
      }

      const fileMetadata = {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
        parents: [parentId],
      };

      const folder = await drive.files.create({
        requestBody: fileMetadata,
        fields: "id, name, mimeType",
        supportsAllDrives: true,
      });

      return folder.data;
    } catch (error) {
      handleDriveError(error, `Failed to create folder: ${folderName}`);
    }
  }

  /**
   * Helper utility to check if a folder exists by name under a parent folder.
   * @param {string} folderName - Name of the folder to search
   * @param {string} [parentFolderId] - Optional parent folder ID (defaults to root)
   * @param {Object} [options] - Additional options
   * @returns {Promise<Object|null>} Metadata of the folder if found, null otherwise
   */
  async findFolder(folderName, parentFolderId = null, options = {}) {
    try {
      const drive = getGoogleDriveClient();
      const parentId = parentFolderId || this.getRootFolderId();

      console.log(`Google Drive Searching Folder: '${folderName}' under Parent Folder ID: '${parentId}'`);

      if (!parentId) {
        throw new StorageUploadError("Google Drive parent folder ID is undefined. Check environment variables.");
      }

      const escapedFolderName = folderName.replace(/'/g, "\\'");
      const query = `name = '${escapedFolderName}' and mimeType = 'application/vnd.google-apps.folder' and '${parentId}' in parents and trashed = false`;

      const response = await drive.files.list({
        q: query,
        fields: "files(id, name)",
        spaces: "drive",
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });

      const files = response.data.files;
      if (files && files.length > 0) {
        return files[0];
      }
      return null;
    } catch (error) {
      handleDriveError(error, `Failed to search folder: ${folderName}`);
    }
  }

  /**
   * Helper utility to retrieve existing folder or create it if not found.
   * @param {string} folderName - Name of the folder
   * @param {string} [parentFolderId] - Optional parent folder ID (defaults to root)
   * @returns {Promise<Object>} Folder metadata containing the ID
   */
  async getOrCreateFolder(folderName, parentFolderId = null) {
    const parentId = parentFolderId || this.getRootFolderId();
    const existing = await this.findFolder(folderName, parentId);
    if (existing) {
      return existing;
    }
    return this.createFolder(folderName, parentId);
  }
}

module.exports = GoogleDriveService;
