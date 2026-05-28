const express = require("express");
const Submission = require("../models/Submission");
const { asyncHandler } = require("../utils/asyncHandler");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { status = "Pending", department, scholarId, supervisorId } = req.query;
    const query = {};

    if (status) query.status = status;
    if (department) query.department = department;
    if (scholarId) query.scholar = scholarId;
    if (supervisorId) query.supervisor = supervisorId;

    const items = await Submission.find(query)
      .populate("scholar", "name email")
      .populate("supervisor", "name email")
      .sort({ submittedAt: -1 });

    res.json({ items });
  })
);

module.exports = router;
