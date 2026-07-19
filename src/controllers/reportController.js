"use strict";

const Submission = require("../models/Submission");
const User = require("../models/User");
const { asyncHandler } = require("../utils/asyncHandler");

const parseDate = (value) => {
    if (!value)
        return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

// Retrieve aggregated submission statistics for report dashboard
const getSummary = asyncHandler(async (req, res) => {
    const { from, to, researchCenterId } = req.query;
    const query = {};

    if (researchCenterId) {
        const scholars = await User.find({
            $or: [{ role: "scholar" }, { roles: "scholar" }],
            researchCenter: researchCenterId
        }).select("_id");
        query.scholar = { $in: scholars.map((s) => s._id) };
    }

    const fromDate = parseDate(from);
    const toDate = parseDate(to);
    if (fromDate || toDate) {
        query.submittedAt = {};
        if (fromDate) query.submittedAt.$gte = fromDate;
        if (toDate) query.submittedAt.$lte = toDate;
    }

    const [total, pending, approved, rejected, inReview] = await Promise.all([
        Submission.countDocuments(query),
        Submission.countDocuments({ ...query, status: "Pending" }),
        Submission.countDocuments({ ...query, status: "Approved" }),
        Submission.countDocuments({ ...query, status: "Rejected" }),
        Submission.countDocuments({ ...query, status: "In Review" }),
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
