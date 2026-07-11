"use strict";

const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/uploadController");
const { authenticate } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
// Protected upload endpoint using multer memory storage
router.post("/", authenticate, upload.single("file"), uploadController.handleUpload);
// GET handler to simulate serving the uploaded file for MVP/testing purposes
router.get("/:key", (req, res) => {
    res.json({
        message: "File serving simulation for MVP",
        fileKey: req.params.key,
    });
});
module.exports = router;
