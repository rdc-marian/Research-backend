const express = require("express");
const { upload } = require("../middleware/upload");
const { isS3Configured } = require("../config/s3");
const { uploadBuffer } = require("../utils/s3Upload");
const { asyncHandler } = require("../utils/asyncHandler");

const router = express.Router();

router.post(
  "/",
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400).json({ message: "file is required" });
      return;
    }

    if (!isS3Configured()) {
      res.status(400).json({ message: "AWS S3 is not configured" });
      return;
    }

    const result = await uploadBuffer(req.file.buffer, {
      folder: "research-uploads",
      originalName: req.file.originalname,
      contentType: req.file.mimetype,
    });

    res.status(201).json({
      item: {
        url: result.url,
        publicId: result.key,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      },
    });
  })
);

module.exports = router;
