const express = require("express");
const Submission = require("../models/Submission");
const { asyncHandler } = require("../utils/asyncHandler");

const router = express.Router();

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const buildMatch = (params) => {
  const match = {};

  if (params.department) {
    match.department = params.department;
  }

  const fromDate = parseDate(params.from);
  const toDate = parseDate(params.to);

  if (fromDate || toDate) {
    match.submittedAt = {};
    if (fromDate) match.submittedAt.$gte = fromDate;
    if (toDate) match.submittedAt.$lte = toDate;
  }

  return match;
};

router.get(
  "/summary",
  asyncHandler(async (req, res) => {
    const match = buildMatch(req.query);
    const total = await Submission.countDocuments(match);

    const statusAgg = await Submission.aggregate([
      { $match: match },
      { $group: { _id: "$status", total: { $sum: 1 } } },
    ]);

    const byStatus = {
      Pending: 0,
      Approved: 0,
      Rejected: 0,
      "In Review": 0,
    };

    statusAgg.forEach((item) => {
      byStatus[item._id] = item.total;
    });

    const departmentAgg = await Submission.aggregate([
      { $match: match },
      { $group: { _id: "$department", total: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    const byDepartment = departmentAgg.map((item) => ({
      department: item._id,
      total: item.total,
    }));

    res.json({ total, byStatus, byDepartment });
  })
);

module.exports = router;
