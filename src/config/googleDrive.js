/**
 * @file googleDrive.js
 * @description Dedicated Google Drive configuration module responsible only for
 * authentication and initializing the Google Drive client using GoogleAuth with a Service Account.
 */

const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");

// Ensure environment variables are loaded immediately
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

let driveClient = null;

/**
 * Configure and initialize the Google Drive API client using google.auth.GoogleAuth.
 * @returns {Promise<google.drive>} Authorized Google Drive client instance
 */
const configureGoogleDrive = async () => {
  if (driveClient) {
    return driveClient;
  }

  const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
  const keyFilePath = path.join(__dirname, "..", "..", "credentials", "google-service-account.json");
  const fileExists = fs.existsSync(keyFilePath);

  if (!rootFolderId) {
    throw new Error("GOOGLE_DRIVE_ROOT_FOLDER_ID environment variable is not defined");
  }

  if (!fileExists) {
    throw new Error(`Google Service Account credentials file not found at: ${keyFilePath}`);
  }

  try {
    // 1. Initialize GoogleAuth with the credentials file and drive scope
    const auth = new google.auth.GoogleAuth({
      keyFile: keyFilePath,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    // 2. Obtain authorized client
    const authClient = await auth.getClient();

    // 3. Create the Google Drive client instance passing the auth client
    driveClient = google.drive({ version: "v3", auth: authClient });

    // 4. Retrieve credentials for validation logging
    const credentials = await auth.getCredentials();
    const serviceAccountEmail = credentials.client_email || "Unknown";

    console.log("Google Drive Integration Startup Validation:");
    console.log(`  - GOOGLE_DRIVE_ROOT_FOLDER_ID: ${rootFolderId}`);
    console.log(`  - Service Account Key File: FOUND`);
    console.log(`  - Authenticated Service Account Email: ${serviceAccountEmail}`);

    return driveClient;
  } catch (error) {
    throw new Error(`Failed to initialize Google Drive client: ${error.message}`);
  }
};

/**
 * Get the initialized Google Drive API client.
 * Note: Configures synchronously/asynchronously. If configureGoogleDrive hasn't completed,
 * it will be initialized on the first call.
 * @returns {google.drive} Authorized Google Drive client instance
 */
const getGoogleDriveClient = () => {
  if (!driveClient) {
    // Fallback sync init if configure has not been called/resolved
    const keyFilePath = path.join(__dirname, "..", "..", "credentials", "google-service-account.json");
    const auth = new google.auth.GoogleAuth({
      keyFile: keyFilePath,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });
    driveClient = google.drive({ version: "v3", auth });
  }
  return driveClient;
};

module.exports = {
  configureGoogleDrive,
  getGoogleDriveClient,
};
