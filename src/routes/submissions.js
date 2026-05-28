const express = require("express");
const Submission = require("../models/Submission");
const { upload } = require("../middleware/upload");
const { isCloudinaryConfigured } = require("../config/cloudinary");
const { uploadBuffer } = require("../utils/cloudinaryUpload");
const { asyncHandler } = require("../utils/asyncHandler");

const router = express.Router();

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const buildSubmissionQuery = (params) => {
  const query = {};

  if (params.status) query.status = params.status;
  if (params.department) query.department = params.department;
  if (params.scholarId) query.scholar = params.scholarId;
  if (params.supervisorId) query.supervisor = params.supervisorId;

  if (params.search) {
    const regex = new RegExp(params.search, "i");
    query.$or = [{ title: regex }, { abstract: regex }];
  }

  const fromDate = parseDate(params.from);
  const toDate = parseDate(params.to);

  if (fromDate || toDate) {
    query.submittedAt = {};
    if (fromDate) query.submittedAt.$gte = fromDate;
    if (toDate) query.submittedAt.$lte = toDate;
  }

  return query;
};

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const query = buildSubmissionQuery(req.query);

    const items = await Submission.find(query)
      .populate("scholar", "name email")
      .populate("supervisor", "name email")
      .sort({ submittedAt: -1 });

    res.json({ items });
  })
);

router.post(
  "/",
  upload.single("file"),
  asyncHandler(async (req, res) => {
    const { title, abstract, department, scholarId, supervisorId } = req.body;

    if (!title || !abstract || !department || !scholarId) {
      res
        .status(400)
        .json({ message: "title, abstract, department, and scholarId are required" });
      return;
    }

    let fileData;

    if (req.file) {
      if (!isCloudinaryConfigured()) {
        res.status(400).json({ message: "Cloudinary is not configured" });
        return;
      }

      const result = await uploadBuffer(req.file.buffer, {
        folder: "research-submissions",
        resource_type: "auto",
      });

      fileData = {
        url: result.secure_url,
        publicId: result.public_id,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      };
    }

    const item = await Submission.create({
      title,
      abstract,
      department,
      scholar: scholarId,
      supervisor: supervisorId || undefined,
      file: fileData,
    });

    const populated = await item
      .populate("scholar", "name email")
      .populate("supervisor", "name email");

    res.status(201).json({ item: populated });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const item = await Submission.findById(req.params.id)
      .populate("scholar", "name email")
      .populate("supervisor", "name email")
      .populate("reviewer", "name email");

    if (!item) {
      res.status(404).json({ message: "Submission not found" });
      return;
    }

    res.json({ item });
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

    const allowed = ["Pending", "Approved", "Rejected", "In Review"];
    if (!allowed.includes(status)) {
      res.status(400).json({ message: "Invalid status" });
      return;
    }

    const update = {
      status,
      reviewNote: note,
      reviewer: reviewerId || undefined,
      reviewedAt: status === "Pending" ? null : new Date(),
    };

    const item = await Submission.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    })
      .populate("scholar", "name email")
      .populate("supervisor", "name email")
      .populate("reviewer", "name email");

    if (!item) {
      res.status(404).json({ message: "Submission not found" });
      return;
    }

    res.json({ item });
  })
);

module.exports = router;
