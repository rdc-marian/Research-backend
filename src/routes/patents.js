const express = require("express");
const Patent = require("../models/Patent");
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

    const items = await Patent.find(query)
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
    const { scholarId, title, applicationNumber, patentStatus, filingDate, publicationDate, grantDate, inventors, patentUrl } = req.body;

    if (!scholarId || !title || !applicationNumber || !filingDate || !inventors) {
      res.status(400).json({ message: "scholarId, title, applicationNumber, filingDate, and inventors are required" });
      return;
    }

    let fileData;
    if (req.file) {
      if (!isS3Configured()) {
        res.status(400).json({ message: "AWS S3 is not configured" });
        return;
      }
      const result = await uploadBuffer(req.file.buffer, {
        folder: "portfolio-patents",
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

    const item = await Patent.create({
      scholar: scholarId,
      title,
      applicationNumber,
      patentStatus: patentStatus || "Filed",
      filingDate: new Date(filingDate),
      publicationDate: publicationDate ? new Date(publicationDate) : undefined,
      grantDate: grantDate ? new Date(grantDate) : undefined,
      inventors,
      patentUrl,
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
    const item = await Patent.findById(req.params.id)
      .populate("scholar", "name email department guide")
      .populate("verifiedBy", "name email");

    if (!item) {
      res.status(404).json({ message: "Patent not found" });
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
        folder: "portfolio-patents",
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

    if (update.filingDate) update.filingDate = new Date(update.filingDate);
    if (update.publicationDate) update.publicationDate = new Date(update.publicationDate);
    if (update.grantDate) update.grantDate = new Date(update.grantDate);

    update.verificationStatus = "Pending";
    update.verifiedBy = undefined;
    update.verifiedAt = undefined;

    const item = await Patent.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    }).populate("scholar", "name email department guide");

    if (!item) {
      res.status(404).json({ message: "Patent not found" });
      return;
    }

    res.json({ item });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const item = await Patent.findByIdAndDelete(req.params.id);
    if (!item) {
      res.status(404).json({ message: "Patent not found" });
      return;
    }
    res.json({ message: "Patent deleted" });
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

    const item = await Patent.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    })
      .populate("scholar", "name email department guide")
      .populate("verifiedBy", "name email");

    if (!item) {
      res.status(404).json({ message: "Patent not found" });
      return;
    }

    res.json({ item });
  })
);

module.exports = router;
