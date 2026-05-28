const express = require("express");
const { upload } = require("../middleware/upload");
const { isCloudinaryConfigured } = require("../config/cloudinary");
const { uploadBuffer } = require("../utils/cloudinaryUpload");
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

    if (!isCloudinaryConfigured()) {
      res.status(400).json({ message: "Cloudinary is not configured" });
      return;
    }

    const result = await uploadBuffer(req.file.buffer, {
      folder: "research-uploads",
      resource_type: "auto",
    });

    res.status(201).json({
      item: {
        url: result.secure_url,
        publicId: result.public_id,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      },
    });
  })
);

module.exports = router;
