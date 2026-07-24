/**
 * @file StorageService.js
 * @description Abstract base class defining the contract/interface for storage providers.
 * Future providers (AWS S3, Azure Blob, Local Storage) should extend this class and implement
 * its methods to ensure clean interchangeability without affecting backend business logic.
 */

class StorageService {
  /**
   * Upload a file to storage.
   * @param {Object} file - The file object (e.g., Express/Multer file with buffer and metadata)
   * @param {Object} [options] - Additional options (e.g., target folder ID, custom file name)
   * @returns {Promise<Object>} Object containing the upload results (e.g., file ID, URL)
   */
  async uploadFile(file, options = {}) {
    throw new Error("Method 'uploadFile()' must be implemented");
  }

  /**
   * Download a file as a readable stream.
   * @param {string} fileId - The identifier of the file to download
   * @param {Object} [options] - Additional options
   * @returns {Promise<ReadableStream>} A stream containing the file contents
   */
  async downloadFile(fileId, options = {}) {
    throw new Error("Method 'downloadFile()' must be implemented");
  }

  /**
   * Delete a file from storage.
   * @param {string} fileId - The identifier of the file to delete
   * @param {Object} [options] - Additional options
   * @returns {Promise<boolean>} Resolves to true if deleted successfully
   */
  async deleteFile(fileId, options = {}) {
    throw new Error("Method 'deleteFile()' must be implemented");
  }

  /**
   * Create a folder under a parent folder.
   * @param {string} folderName - Name of the folder to create
   * @param {string} [parentFolderId] - Parent folder ID
   * @param {Object} [options] - Additional options
   * @returns {Promise<Object>} Created folder details
   */
  async createFolder(folderName, parentFolderId = null, options = {}) {
    throw new Error("Method 'createFolder()' must be implemented");
  }

  /**
   * Find a folder by name under a parent folder.
   * @param {string} folderName - Name of the folder to search
   * @param {string} [parentFolderId] - Parent folder ID
   * @param {Object} [options] - Additional options
   * @returns {Promise<Object|null>} Found folder details or null
   */
  async findFolder(folderName, parentFolderId = null, options = {}) {
    throw new Error("Method 'findFolder()' must be implemented");
  }

  /**
   * Retrieve metadata for a file.
   * @param {string} fileId - The identifier of the file
   * @param {Object} [options] - Additional options
   * @returns {Promise<Object>} The file metadata details
   */
  async getFile(fileId, options = {}) {
    throw new Error("Method 'getFile()' must be implemented");
  }

  /**
   * Generate a URL for a file.
   * @param {string} fileId - The identifier of the file
   * @param {Object} [options] - Additional options
   * @returns {Promise<string>} The file URL
   */
  async getFileUrl(fileId, options = {}) {
    throw new Error("Method 'getFileUrl()' must be implemented");
  }
}

module.exports = StorageService;
