"use strict";

const ScholarProgress = require("../models/ScholarProgress");
const { asyncHandler } = require("../utils/asyncHandler");
// Retrieve scholar progress tracking record
const getByScholar = asyncHandler(async (req, res) => {
    const scholarId = req.query.scholarId || req.params.scholarId;
    if (!scholarId) {
        return res.status(400).json({ message: "scholarId is required" });
    }
    const progress = await ScholarProgress.findOne({ scholar: scholarId })
        .populate("scholar", "name email department guide")
        .populate("guide", "name email");
    if (!progress) {
        return res.json({ item: null });
    }
    res.json({ item: progress });
});
// Create or update progress tracking for a scholar
const upsert = asyncHandler(async (req, res) => {
    const scholarId = req.body.scholarId || req.body.scholar;
    if (!scholarId) {
        return res.status(400).json({ message: "scholarId is required" });
    }
    const updates = { ...req.body, scholar: scholarId };
    delete updates._id;
    if (req.user && req.user.userId) {
        updates.lastUpdatedBy = req.user.userId;
    }
    const progress = await ScholarProgress.findOneAndUpdate({ scholar: scholarId }, updates, {
        new: true,
        upsert: true,
        runValidators: true,
    })
        .populate("scholar", "name email department guide")
        .populate("guide", "name email");
    res.json({ item: progress });
});
module.exports = {
    getByScholar,
    upsert,
};
