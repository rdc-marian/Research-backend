const express = require("express");
const Submission = require("../models/Submission");
const User = require("../models/User");
const { asyncHandler } = require("../utils/asyncHandler");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const {
      status = "Pending",
      department,
      scholarId,
      supervisorId,
      guideId,
      researchCenterId,
    } = req.query;
    const query = {};

    if (status) query.status = status;
    if (department) query.department = department;
    if (scholarId) {
      query.scholar = scholarId;
    } else if (guideId || researchCenterId) {
      const scholarQuery = {
        $or: [{ role: "scholar" }, { roles: "scholar" }],
      };
      if (guideId) scholarQuery.guide = guideId;
      if (researchCenterId) scholarQuery.researchCenter = researchCenterId;

      const scholars = await User.find(scholarQuery).select("_id");
      query.scholar = { $in: scholars.map((item) => item._id) };
    }
    if (supervisorId) query.supervisor = supervisorId;

    const items = await Submission.find(query)
      .populate({
        path: "scholar",
        select: "name email researchCenter guide",
        populate: [
          { path: "researchCenter", select: "name code" },
          { path: "guide", select: "name email" },
        ],
      })
      .populate("supervisor", "name email")
      .sort({ submittedAt: -1 });

    res.json({ items });
  })
);

module.exports = router;
