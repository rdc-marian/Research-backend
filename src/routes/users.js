const express = require("express");
const User = require("../models/User");
const { asyncHandler } = require("../utils/asyncHandler");
const { buildRoleQuery, normalizeRoles } = require("../utils/roles");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { role, roles, status, department, search, researchCenterId, guideId } = req.query;
    const query = {};
    const andFilters = [];

    if (role) {
      andFilters.push(buildRoleQuery(role));
    }

    if (roles) {
      const roleList = String(roles)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      if (roleList.length > 0) {
        andFilters.push({
          $or: [{ roles: { $in: roleList } }, { role: { $in: roleList } }],
        });
      }
    }

    if (status) query.status = status;
    if (department) query.department = department;
    if (researchCenterId) query.researchCenter = researchCenterId;
    if (guideId) query.guide = guideId;

    if (search) {
      const regex = new RegExp(search, "i");
      andFilters.push({ $or: [{ name: regex }, { email: regex }] });
    }

    if (andFilters.length > 0) {
      query.$and = andFilters;
    }

    const items = await User.find(query)
      .populate("researchCenter", "name code")
      .populate("guide", "name email")
      .sort({ createdAt: -1 });
    res.json({ items });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const {
      name,
      email,
      role,
      roles,
      department,
      status,
      phone,
      researchCenterId,
      guideId,
    } = req.body;

    const { primaryRole, roles: normalizedRoles } = normalizeRoles({ role, roles });

    if (!name || !email || !primaryRole) {
      res.status(400).json({ message: "name, email, and role are required" });
      return;
    }

    if (normalizedRoles.includes("scholar")) {
      if (!researchCenterId || !guideId) {
        res.status(400).json({
          message: "researchCenterId and guideId are required for scholars",
        });
        return;
      }
    }

    if (normalizedRoles.includes("research_guide") && !researchCenterId) {
      res.status(400).json({
        message: "researchCenterId is required for research guides",
      });
      return;
    }

    const item = await User.create({
      name,
      email,
      role: primaryRole,
      roles: normalizedRoles.length > 0 ? normalizedRoles : undefined,
      department,
      status,
      phone,
      researchCenter: researchCenterId || undefined,
      guide: guideId || undefined,
    });

    const populated = await item.populate([
      { path: "researchCenter", select: "name code" },
      { path: "guide", select: "name email" },
    ]);

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
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ item });
  })
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const update = { ...req.body };
    if (update.researchCenterId) {
      update.researchCenter = update.researchCenterId;
      delete update.researchCenterId;
    }
    if (update.guideId) {
      update.guide = update.guideId;
      delete update.guideId;
    }

    const existing = await User.findById(req.params.id);
    if (!existing) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const nextRole = update.role ?? existing.role;
    const nextRolesInput = update.roles ?? existing.roles;
    const { primaryRole, roles: normalizedRoles } = normalizeRoles({
      role: nextRole,
      roles: nextRolesInput,
    });

    const nextResearchCenter = update.researchCenter ?? existing.researchCenter;
    const nextGuide = update.guide ?? existing.guide;
    const hasScholarRole =
      normalizedRoles.includes("scholar") || primaryRole === "scholar";
    const hasGuideRole =
      normalizedRoles.includes("research_guide") || primaryRole === "research_guide";

    if (hasScholarRole && (!nextResearchCenter || !nextGuide)) {
      res.status(400).json({
        message: "researchCenterId and guideId are required for scholars",
      });
      return;
    }

    if (hasGuideRole && !nextResearchCenter) {
      res.status(400).json({
        message: "researchCenterId is required for research guides",
      });
      return;
    }

    if (primaryRole) {
      update.role = primaryRole;
    }

    if (normalizedRoles.length > 0) {
      update.roles = normalizedRoles;
    }

    const item = await User.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    })
      .populate("researchCenter", "name code")
      .populate("guide", "name email");

    res.json({ item });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const item = await User.findByIdAndDelete(req.params.id);

    if (!item) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ message: "User deleted" });
  })
);

module.exports = router;
