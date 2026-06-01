const express = require("express");
const User = require("../models/User");
const { asyncHandler } = require("../utils/asyncHandler");
const { buildRoleQuery, normalizeRoles } = require("../utils/roles");

const router = express.Router();

const baseRoleQuery = buildRoleQuery("research_guide");

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { status, researchCenterId, search } = req.query;
    const query = { ...baseRoleQuery };

    if (status) query.status = status;
    if (researchCenterId) query.researchCenter = researchCenterId;

    if (search) {
      const regex = new RegExp(search, "i");
      query.$and = [{ $or: [{ name: regex }, { email: regex }] }];
    }

    const items = await User.find(query)
      .populate("researchCenter", "name code")
      .sort({ createdAt: -1 });

    res.json({ items });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, email, roles, department, status, phone, researchCenterId } = req.body;

    if (!name || !email || !researchCenterId) {
      res
        .status(400)
        .json({ message: "name, email, and researchCenterId are required" });
      return;
    }

    const { primaryRole, roles: normalizedRoles } = normalizeRoles({
      role: "research_guide",
      roles,
    });

    if (!normalizedRoles.includes("research_guide")) {
      normalizedRoles.push("research_guide");
    }

    const item = await User.create({
      name,
      email,
      role: primaryRole,
      roles: normalizedRoles,
      department,
      status,
      phone,
      researchCenter: researchCenterId,
    });

    const populated = await item.populate("researchCenter", "name code");

    res.status(201).json({ item: populated });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const item = await User.findById(req.params.id)
      .populate("researchCenter", "name code")
      .populate("guide", "name email");

    if (!item) {
      res.status(404).json({ message: "Research guide not found" });
      return;
    }

    res.json({ item });
  })
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const update = { ...req.body };

    if (update.researchCenterId) {
      update.researchCenter = update.researchCenterId;
      delete update.researchCenterId;
    }

    const existing = await User.findById(req.params.id);
    if (!existing) {
      res.status(404).json({ message: "Research guide not found" });
      return;
    }

    const nextRole = update.role ?? existing.role ?? "research_guide";
    const nextRolesInput = update.roles ?? existing.roles;
    const { primaryRole, roles: normalizedRoles } = normalizeRoles({
      role: nextRole,
      roles: nextRolesInput,
    });

    if (!normalizedRoles.includes("research_guide")) {
      normalizedRoles.push("research_guide");
    }

    update.role = primaryRole || "research_guide";
    update.roles = normalizedRoles;

    const item = await User.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    })
      .populate("researchCenter", "name code")
      .populate("guide", "name email");

    if (!item) {
      res.status(404).json({ message: "Research guide not found" });
      return;
    }

    res.json({ item });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const item = await User.findByIdAndDelete(req.params.id);

    if (!item) {
      res.status(404).json({ message: "Research guide not found" });
      return;
    }

    res.json({ message: "Research guide deleted" });
  })
);

module.exports = router;
