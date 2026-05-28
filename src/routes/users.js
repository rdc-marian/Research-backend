const express = require("express");
const User = require("../models/User");
const { asyncHandler } = require("../utils/asyncHandler");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { role, status, department, search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (status) query.status = status;
    if (department) query.department = department;

    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [{ name: regex }, { email: regex }];
    }

    const items = await User.find(query).sort({ createdAt: -1 });
    res.json({ items });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, email, role, department, status, phone } = req.body;

    if (!name || !email || !role) {
      res.status(400).json({ message: "name, email, and role are required" });
      return;
    }

    const item = await User.create({
      name,
      email,
      role,
      department,
      status,
      phone,
    });

    res.status(201).json({ item });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const item = await User.findById(req.params.id);

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
    const item = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ item });
  })
);

module.exports = router;
