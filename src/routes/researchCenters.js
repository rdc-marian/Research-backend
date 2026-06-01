const express = require("express");
const ResearchCenter = require("../models/ResearchCenter");
const User = require("../models/User");
const { asyncHandler } = require("../utils/asyncHandler");

const router = express.Router();

const buildSearchQuery = (params) => {
  const query = {};

  if (params.status) query.status = params.status;
  if (params.departmentId) query.department = params.departmentId;
  if (params.coordinatorId) query.coordinator = params.coordinatorId;

  if (params.search) {
    const regex = new RegExp(params.search, "i");
    query.$or = [{ name: regex }, { code: regex }];
  }

  return query;
};

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const query = buildSearchQuery(req.query);

    const items = await ResearchCenter.find(query)
      .populate("coordinator", "name email")
      .populate("department", "name");

    res.json({ items });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, code, coordinatorId, departmentId, status } = req.body;

    if (!name || !code || !departmentId) {
      res.status(400).json({ message: "name, code, and departmentId are required" });
      return;
    }

    const item = await ResearchCenter.create({
      name,
      code,
      coordinator: coordinatorId || undefined,
      department: departmentId,
      status: status || undefined,
    });

    const populated = await item.populate([
      { path: "coordinator", select: "name email" },
      { path: "department", select: "name" },
    ]);

    res.status(201).json({ item: populated });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const item = await ResearchCenter.findById(req.params.id)
      .populate("coordinator", "name email")
      .populate("department", "name");

    if (!item) {
      res.status(404).json({ message: "Research center not found" });
      return;
    }

    res.json({ item });
  })
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const update = { ...req.body };

    if (update.coordinatorId) {
      update.coordinator = update.coordinatorId;
      delete update.coordinatorId;
    }

    if (update.departmentId) {
      update.department = update.departmentId;
      delete update.departmentId;
    }

    const item = await ResearchCenter.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    })
      .populate("coordinator", "name email")
      .populate("department", "name");

    if (!item) {
      res.status(404).json({ message: "Research center not found" });
      return;
    }

    res.json({ item });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const item = await ResearchCenter.findByIdAndDelete(req.params.id);

    if (!item) {
      res.status(404).json({ message: "Research center not found" });
      return;
    }

    res.json({ message: "Research center deleted" });
  })
);

router.get(
  "/:id/guides",
  asyncHandler(async (req, res) => {
    const guides = await User.find({
      researchCenter: req.params.id,
      $or: [{ role: "research_guide" }, { roles: "research_guide" }],
    })
      .populate("researchCenter", "name code")
      .sort({ createdAt: -1 });

    res.json({ items: guides });
  })
);

module.exports = router;
