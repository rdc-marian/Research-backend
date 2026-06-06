const express = require("express");
const Scholarship = require("../models/Scholarship");
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

    const items = await Scholarship.find(query)
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
    const { scholarId, name, sponsoringAgency, amountPerMonth, startDate, endDate, scholarshipStatus } = req.body;

    if (!scholarId || !name || !sponsoringAgency || !amountPerMonth || !startDate) {
      res.status(400).json({ message: "scholarId, name, sponsoringAgency, amountPerMonth, and startDate are required" });
      return;
    }

    let fileData;
    if (req.file) {
      if (!isS3Configured()) {
        res.status(400).json({ message: "AWS S3 is not configured" });
        return;
      }
      const result = await uploadBuffer(req.file.buffer, {
        folder: "portfolio-scholarships",
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

    const item = await Scholarship.create({
      scholar: scholarId,
      name,
      sponsoringAgency,
      amountPerMonth: Number(amountPerMonth),
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      scholarshipStatus: scholarshipStatus || "Active",
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
    const item = await Scholarship.findById(req.params.id)
      .populate("scholar", "name email department guide")
      .populate("verifiedBy", "name email");

    if (!item) {
      res.status(404).json({ message: "Scholarship not found" });
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
        folder: "portfolio-scholarships",
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
    if (update.amountPerMonth !== undefined) update.amountPerMonth = update.amountPerMonth ? Number(update.amountPerMonth) : undefined;

    update.verificationStatus = "Pending";
    update.verifiedBy = undefined;
    update.verifiedAt = undefined;

    const item = await Scholarship.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    }).populate("scholar", "name email department guide");

    if (!item) {
      res.status(404).json({ message: "Scholarship not found" });
      return;
    }

    res.json({ item });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const item = await Scholarship.findByIdAndDelete(req.params.id);
    if (!item) {
      res.status(404).json({ message: "Scholarship not found" });
      return;
    }
    res.json({ message: "Scholarship deleted" });
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

    const item = await Scholarship.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    })
      .populate("scholar", "name email department guide")
      .populate("verifiedBy", "name email");

    if (!item) {
      res.status(404).json({ message: "Scholarship not found" });
      return;
    }

    res.json({ item });
  })
);

module.exports = router;
