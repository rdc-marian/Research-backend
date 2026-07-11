"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ResearchProfile = require("../models/ResearchProfile");
const { asyncHandler } = require("../utils/asyncHandler");
// Retrieve research profile for a user
const getByUser = asyncHandler(async (req, res) => {
    const userId = req.query.userId || req.params.userId || (req.user && req.user.userId);
    if (!userId) {
        return res.status(400).json({ message: "userId is required" });
    }
    const profile = await ResearchProfile.findOne({ userId }).populate("userId", "name email role roles department");
    if (!profile) {
        // Return empty profile object rather than 404 to let frontend initialize cleanly
        return res.json({ item: null });
    }
    res.json({ item: profile });
});
// Create or update (upsert) a user's research profile
const upsert = asyncHandler(async (req, res) => {
    const userId = req.body.userId || (req.user && req.user.userId);
    if (!userId) {
        return res.status(400).json({ message: "userId is required" });
    }
    const updates = { ...req.body, userId };
    delete updates._id; // prevent modifying immutable _id fields if passed from frontend
    const profile = await ResearchProfile.findOneAndUpdate({ userId }, updates, {
        new: true,
        upsert: true,
        runValidators: true,
    }).populate("userId", "name email role roles department");
    res.json({ item: profile });
});
module.exports = {
    getByUser,
    upsert,
};
