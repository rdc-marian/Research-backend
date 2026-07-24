/**
 * @file StorageErrors.js
 * @description Meaningful custom storage error classes to handle different failure modes
 * (authentication, permissions, missing items, rate limits, upload errors) gracefully.
 */

class StorageError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

class StorageAuthError extends StorageError {
  constructor(message = "Storage authentication failed", details = null) {
    super(message, 401, details);
  }
}

class StoragePermissionError extends StorageError {
  constructor(message = "Permission denied for storage operation", details = null) {
    super(message, 403, details);
  }
}

class StorageNotFoundError extends StorageError {
  constructor(message = "Resource not found in storage", details = null) {
    super(message, 404, details);
  }
}

class StorageRateLimitError extends StorageError {
  constructor(message = "Storage rate limit or API limit exceeded", details = null) {
    super(message, 429, details);
  }
}

class StorageUploadError extends StorageError {
  constructor(message = "Failed to upload file to storage", details = null) {
    super(message, 500, details);
  }
}

module.exports = {
  StorageError,
  StorageAuthError,
  StoragePermissionError,
  StorageNotFoundError,
  StorageRateLimitError,
  StorageUploadError,
};
