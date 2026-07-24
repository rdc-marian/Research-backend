"use strict";

const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true, // e.g. "Proposal", "Thesis", "Publication", "Certificate", "Leave_Attachment"
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    driveFileId: {
      type: String,
      required: true,
    },
    driveFolderId: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    storageProvider: {
      type: String,
      required: true,
      default: "google-drive",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", DocumentSchema);
