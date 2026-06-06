const express = require("express");
const Publication = require("../models/Publication");
const User = require("../models/User");
const { upload } = require("../middleware/upload");
const { isS3Configured } = require("../config/s3");
const { uploadBuffer } = require("../utils/s3Upload");
const { asyncHandler } = require("../utils/asyncHandler");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { scholarId, status, department, guideId } = req.query;
    const query = {};

    if (scholarId) query.scholar = scholarId;
    if (status) query.verificationStatus = status;

    if (department || guideId) {
      const scholarQuery = {
        $or: [{ role: "scholar" }, { roles: "scholar" }],
      };
      if (department) scholarQuery.department = department;
      if (guideId) scholarQuery.guide = guideId;

      const scholars = await User.find(scholarQuery).select("_id");
      query.scholar = { $in: scholars.map((item) => item._id) };
    }

    const items = await Publication.find(query)
      .populate("scholar", "name email department guide")
      .populate("verifiedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({ items });
  })
);

router.post(
  "/",
  upload.single("file"),
  asyncHandler(async (req, res) => {
    const { scholarId, title, authors, journalName, volume, issue, pages, issnIsbn, publishDate, impactFactor, indexing, publicationUrl } = req.body;

    if (!scholarId || !title || !authors || !journalName || !publishDate) {
      res.status(400).json({ message: "scholarId, title, authors, journalName, and publishDate are required" });
      return;
    }

    let fileData;
    if (req.file) {
      if (!isS3Configured()) {
        res.status(400).json({ message: "AWS S3 is not configured" });
        return;
      }
      const result = await uploadBuffer(req.file.buffer, {
        folder: "portfolio-publications",
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
    }

    let indexArray = [];
    if (indexing) {
      indexArray = Array.isArray(indexing) ? indexing : JSON.parse(indexing);
    }

    const item = await Publication.create({
      scholar: scholarId,
      title,
      authors,
      journalName,
      volume,
      issue,
      pages,
      issnIsbn,
      publishDate: new Date(publishDate),
      impactFactor: impactFactor ? Number(impactFactor) : undefined,
      indexing: indexArray,
      publicationUrl,
      document: fileData,
    });

    const populated = await item.populate([
      { path: "scholar", select: "name email department guide" }
    ]);

    res.status(201).json({ item: populated });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const item = await Publication.findById(req.params.id)
      .populate("scholar", "name email department guide")
      .populate("verifiedBy", "name email");

    if (!item) {
      res.status(404).json({ message: "Publication not found" });
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
        folder: "portfolio-publications",
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

    if (update.indexing) {
      update.indexing = Array.isArray(update.indexing) ? update.indexing : JSON.parse(update.indexing);
    }
    if (update.publishDate) {
      update.publishDate = new Date(update.publishDate);
    }
    if (update.impactFactor !== undefined) {
      update.impactFactor = update.impactFactor ? Number(update.impactFactor) : undefined;
    }

    update.verificationStatus = "Pending";
    update.verifiedBy = undefined;
    update.verifiedAt = undefined;

    const item = await Publication.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    }).populate("scholar", "name email department guide");

    if (!item) {
      res.status(404).json({ message: "Publication not found" });
      return;
    }

    res.json({ item });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const item = await Publication.findByIdAndDelete(req.params.id);
    if (!item) {
      res.status(404).json({ message: "Publication not found" });
      return;
    }
    res.json({ message: "Publication deleted" });
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

    const allowed = ["Pending", "Approved", "Rejected"];
    if (!allowed.includes(status)) {
      res.status(400).json({ message: "Invalid status" });
      return;
    }

    const update = {
      verificationStatus: status,
      guideNote: note,
      verifiedBy: reviewerId || undefined,
      verifiedAt: status === "Pending" ? null : new Date(),
    };

    const item = await Publication.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    })
      .populate("scholar", "name email department guide")
      .populate("verifiedBy", "name email");

    if (!item) {
      res.status(404).json({ message: "Publication not found" });
      return;
    }

    res.json({ item });
  })
);

module.exports = router;
