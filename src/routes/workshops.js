const express = require("express");
const Workshop = require("../models/Workshop");
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

    const items = await Workshop.find(query)
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
    const { scholarId, title, role, organizer, venue, startDate, endDate, durationDays, fundingAgency } = req.body;

    if (!scholarId || !title || !organizer || !venue || !startDate || !endDate) {
      res.status(400).json({ message: "scholarId, title, organizer, venue, startDate, and endDate are required" });
      return;
    }

    let fileData;
    if (req.file) {
      if (!isS3Configured()) {
        res.status(400).json({ message: "AWS S3 is not configured" });
        return;
      }
      const result = await uploadBuffer(req.file.buffer, {
        folder: "portfolio-workshops",
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

    const item = await Workshop.create({
      scholar: scholarId,
      title,
      role: role || "Attended",
      organizer,
      venue,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      durationDays: durationDays ? Number(durationDays) : undefined,
      fundingAgency,
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
    const item = await Workshop.findById(req.params.id)
      .populate("scholar", "name email department guide")
      .populate("verifiedBy", "name email");

    if (!item) {
      res.status(404).json({ message: "Workshop not found" });
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
        folder: "portfolio-workshops",
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

    if (update.startDate) update.startDate = new Date(update.startDate);
    if (update.endDate) update.endDate = new Date(update.endDate);
    if (update.durationDays !== undefined) update.durationDays = update.durationDays ? Number(update.durationDays) : undefined;

    update.verificationStatus = "Pending";
    update.verifiedBy = undefined;
    update.verifiedAt = undefined;

    const item = await Workshop.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    }).populate("scholar", "name email department guide");

    if (!item) {
      res.status(404).json({ message: "Workshop not found" });
      return;
    }

    res.json({ item });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const item = await Workshop.findByIdAndDelete(req.params.id);
    if (!item) {
      res.status(404).json({ message: "Workshop not found" });
      return;
    }
    res.json({ message: "Workshop deleted" });
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

    const item = await Workshop.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    })
      .populate("scholar", "name email department guide")
      .populate("verifiedBy", "name email");

    if (!item) {
      res.status(404).json({ message: "Workshop not found" });
      return;
    }

    res.json({ item });
  })
);

module.exports = router;
