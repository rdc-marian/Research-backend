"use strict";

const Submission = require("../models/Submission");
const { asyncHandler } = require("../utils/asyncHandler");
// Retrieve aggregated submission statistics for report dashboard
const getSummary = asyncHandler(async (req, res) => {
    const [total, pending, approved, rejected, inReview] = await Promise.all([
        Submission.countDocuments(),
        Submission.countDocuments({ status: "Pending" }),
        Submission.countDocuments({ status: "Approved" }),
        Submission.countDocuments({ status: "Rejected" }),
        Submission.countDocuments({ status: "In Review" }),
    ]);
    res.json({
        total,
        byStatus: {
            Pending: pending,
            Approved: approved,
            Rejected: rejected,
            "In Review": inReview,
        },
    });
});
module.exports = {
    getSummary,
};
