const express = require("express");
const Department = require("../models/Department");
const { asyncHandler } = require("../utils/asyncHandler");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { search, coordinatorId } = req.query;
    const query = {};

    if (coordinatorId) query.coordinator = coordinatorId;
    if (search) query.name = new RegExp(search, "i");

    const items = await Department.find(query).populate("coordinator", "name email");
    res.json({ items });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, email, coordinatorId, totalScholars } = req.body;

    if (!name) {
      res.status(400).json({ message: "name is required" });
      return;
    }

    const item = await Department.create({
      name,
      email,
      coordinator: coordinatorId || undefined,
      totalScholars,
    });

    const populated = await item.populate("coordinator", "name email");
    res.status(201).json({ item: populated });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const item = await Department.findById(req.params.id).populate(
      "coordinator",
      "name email"
    );

    if (!item) {
      res.status(404).json({ message: "Department not found" });
      return;
    }

    res.json({ item });
  })
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const update = { ...req.body };

    if (update.coordinatorId) {
      update.coordinator = update.coordinatorId;
      delete update.coordinatorId;
    }

    const item = await Department.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    }).populate("coordinator", "name email");

    if (!item) {
      res.status(404).json({ message: "Department not found" });
      return;
    }

    res.json({ item });
  })
);

module.exports = router;
