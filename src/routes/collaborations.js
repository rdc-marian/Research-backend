const express = require("express");
const Collaboration = require("../models/Collaboration");
const User = require("../models/User");
const { upload } = require("../middleware/upload");
const { isS3Configured } = require("../config/s3");
const { uploadBuffer } = require("../utils/s3Upload");
const { asyncHandler } = require("../utils/asyncHandler");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { scholarId, status, researchCenterId, guideId } = req.query;
    const query = {};

    if (scholarId) query.scholar = scholarId;
    if (status) query.verificationStatus = status;

    if (researchCenterId || guideId) {
      const scholarQuery = {
        $or: [{ role: "scholar" }, { roles: "scholar" }],
      };
      if (researchCenterId) scholarQuery.researchCenter = researchCenterId;
      if (guideId) scholarQuery.guide = guideId;

      const scholars = await User.find(scholarQuery).select("_id");
      query.scholar = { $in: scholars.map((item) => item._id) };
    }

    const items = await Collaboration.find(query)
      .populate("scholar", "name email researchCenter guide")
      .populate("verifiedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({ items });
  })
);

router.post(
  "/",
  upload.single("file"),
  asyncHandler(async (req, res) => {
    const data = { ...req.body };

    let fileData;
    if (req.file) {
      if (!isS3Configured()) {
        res.status(400).json({ message: "AWS S3 is not configured" });
        return;
      }
      const result = await uploadBuffer(req.file.buffer, {
        folder: "portfolio-collaborations",
        originalName: req.file.originalname,
        contentType: req.file.mimetype,
      });
      fileData = {
        url: result.url,
        publicId: result.key,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      };
      data.document = fileData;
    }

    const item = await Collaboration.create(data);
    const populated = await item.populate([
      { path: "scholar", select: "name email researchCenter guide" }
    ]);

    res.status(201).json({ item: populated });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const item = await Collaboration.findById(req.params.id)
      .populate("scholar", "name email researchCenter guide")
      .populate("verifiedBy", "name email");

    if (!item) {
      res.status(404).json({ message: "Item not found" });
      return;
    }

    res.json({ item });
  })
);

router.patch(
  "/:id",
  upload.single("file"),
  asyncHandler(async (req, res) => {
    const update = { ...req.body };

    if (req.file) {
      if (!isS3Configured()) {
        res.status(400).json({ message: "AWS S3 is not configured" });
        return;
      }
      const result = await uploadBuffer(req.file.buffer, {
        folder: "portfolio-collaborations",
        originalName: req.file.originalname,
        contentType: req.file.mimetype,
      });
      update.document = {
        url: result.url,
        publicId: result.key,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      };
    }

    update.verificationStatus = "Pending";
    update.verifiedBy = undefined;
    update.verifiedAt = undefined;

    const item = await Collaboration.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    }).populate("scholar", "name email researchCenter guide");

    if (!item) {
      res.status(404).json({ message: "Item not found" });
      return;
    }

    res.json({ item });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const item = await Collaboration.findByIdAndDelete(req.params.id);
    if (!item) {
      res.status(404).json({ message: "Item not found" });
      return;
    }
    res.json({ message: "Item deleted" });
  })
);

router.patch(
  "/:id/status",
  asyncHandler(async (req, res) => {
    const { status, reviewerId, note } = req.body;

    if (!status) {
      res.status(400).json({ message: "status is required" });
      return;
    }

    const update = {
      verificationStatus: status,
      guideNote: note,
      verifiedBy: reviewerId || undefined,
      verifiedAt: status === "Pending" ? null : new Date(),
    };

    const item = await Collaboration.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    })
      .populate("scholar", "name email researchCenter guide")
      .populate("verifiedBy", "name email");

    if (!item) {
      res.status(404).json({ message: "Item not found" });
      return;
    }

    res.json({ item });
  })
);

module.exports = router;
