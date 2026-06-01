const express = require("express");
const Submission = require("../models/Submission");
const User = require("../models/User");
const { upload } = require("../middleware/upload");
const { isS3Configured } = require("../config/s3");
const { uploadBuffer } = require("../utils/s3Upload");
const { asyncHandler } = require("../utils/asyncHandler");

const router = express.Router();

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const buildSubmissionQuery = async (params) => {
  const query = {};

  if (params.status) query.status = params.status;
  if (params.department) query.department = params.department;
  if (params.scholarId) {
    query.scholar = params.scholarId;
  } else if (params.guideId || params.researchCenterId) {
    const scholarQuery = {
      $or: [{ role: "scholar" }, { roles: "scholar" }],
    };
    if (params.guideId) scholarQuery.guide = params.guideId;
    if (params.researchCenterId) scholarQuery.researchCenter = params.researchCenterId;

    const scholars = await User.find(scholarQuery).select("_id");
    query.scholar = { $in: scholars.map((item) => item._id) };
  }
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
    const query = await buildSubmissionQuery(req.query);

    const items = await Submission.find(query)
      .populate({
        path: "scholar",
        select: "name email researchCenter guide",
        populate: [
          { path: "researchCenter", select: "name code" },
          { path: "guide", select: "name email" },
        ],
      })
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
      if (!isS3Configured()) {
        res.status(400).json({ message: "AWS S3 is not configured" });
        return;
      }

      const result = await uploadBuffer(req.file.buffer, {
        folder: "research-submissions",
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

    const item = await Submission.create({
      title,
      abstract,
      department,
      scholar: scholarId,
      supervisor: supervisorId || undefined,
      file: fileData,
    });

    const populated = await item.populate([
      {
        path: "scholar",
        select: "name email researchCenter guide",
        populate: [
          { path: "researchCenter", select: "name code" },
          { path: "guide", select: "name email" },
        ],
      },
      { path: "supervisor", select: "name email" },
    ]);

    res.status(201).json({ item: populated });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const item = await Submission.findById(req.params.id)
      .populate({
        path: "scholar",
        select: "name email researchCenter guide",
        populate: [
          { path: "researchCenter", select: "name code" },
          { path: "guide", select: "name email" },
        ],
      })
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
  "/:id",
  upload.single("file"),
  asyncHandler(async (req, res) => {
    const { title, abstract, department, scholarId, supervisorId } = req.body;
    const update = {};

    if (title !== undefined) update.title = title;
    if (abstract !== undefined) update.abstract = abstract;
    if (department !== undefined) update.department = department;
    if (scholarId !== undefined) update.scholar = scholarId;
    if (supervisorId !== undefined) {
      update.supervisor = supervisorId || undefined;
    }

    if (req.file) {
      if (!isS3Configured()) {
        res.status(400).json({ message: "AWS S3 is not configured" });
        return;
      }

      const result = await uploadBuffer(req.file.buffer, {
        folder: "research-submissions",
        originalName: req.file.originalname,
        contentType: req.file.mimetype,
      });

      update.file = {
        url: result.url,
        publicId: result.key,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      };
    }

    if (Object.keys(update).length === 0) {
      res.status(400).json({ message: "No updates provided" });
      return;
    }

    const item = await Submission.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    })
      .populate({
        path: "scholar",
        select: "name email researchCenter guide",
        populate: [
          { path: "researchCenter", select: "name code" },
          { path: "guide", select: "name email" },
        ],
      })
      .populate("supervisor", "name email")
      .populate("reviewer", "name email");

    if (!item) {
      res.status(404).json({ message: "Submission not found" });
      return;
    }

    res.json({ item });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const item = await Submission.findByIdAndDelete(req.params.id);

    if (!item) {
      res.status(404).json({ message: "Submission not found" });
      return;
    }

    res.json({ message: "Submission deleted" });
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
      .populate({
        path: "scholar",
        select: "name email researchCenter guide",
        populate: [
          { path: "researchCenter", select: "name code" },
          { path: "guide", select: "name email" },
        ],
      })
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
