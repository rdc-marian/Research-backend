const fs = require('fs');
const path = require('path');

const models = [
  { name: 'ResearchProject', route: 'projects' },
  { name: 'ResearchGuidance', route: 'guidance' },
  { name: 'ResearchGrant', route: 'grants' },
  { name: 'Award', route: 'awards' },
  { name: 'Consultancy', route: 'consultancy' },
  { name: 'ResourcePerson', route: 'resourcePerson' },
  { name: 'Collaboration', route: 'collaborations' },
  { name: 'ScholarProgress', route: 'scholarProgress' }
];

const template = (modelName, folderName) => `const express = require("express");
const ${modelName} = require("../models/${modelName}");
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

    const items = await ${modelName}.find(query)
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
        folder: "portfolio-${folderName}",
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

    const item = await ${modelName}.create(data);
    const populated = await item.populate([
      { path: "scholar", select: "name email researchCenter guide" }
    ]);

    res.status(201).json({ item: populated });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const item = await ${modelName}.findById(req.params.id)
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
        folder: "portfolio-${folderName}",
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

    const item = await ${modelName}.findByIdAndUpdate(req.params.id, update, {
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
    const item = await ${modelName}.findByIdAndDelete(req.params.id);
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

    const item = await ${modelName}.findByIdAndUpdate(req.params.id, update, {
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
`;

models.forEach(({ name, route }) => {
  const filePath = path.join(__dirname, 'src', 'routes', route + '.js');
  fs.writeFileSync(filePath, template(name, route));
  console.log('Generated ' + filePath);
});
