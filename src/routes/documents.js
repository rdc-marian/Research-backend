"use strict";

const express = require("express");
const router = express.Router();
const documentController = require("../controllers/documentController");
const { authenticate } = require("../middleware/auth");
const { memoryUpload } = require("../middleware/memoryUpload");

// POST upload endpoint
router.post(
  "/upload",
  authenticate,
  memoryUpload.single("file"), // Key name for the uploaded file in post data is 'file'
  documentController.uploadDocument
);

module.exports = router;
