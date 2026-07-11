"use strict";

const SystemSettings = require("../models/SystemSettings");
const { asyncHandler } = require("../utils/asyncHandler");
const mongoose = require("mongoose");
// Retrieve global system settings
const getSettings = asyncHandler(async (req, res) => {
    let settings = await SystemSettings.findOne();
    // If no settings exist yet, create a default configuration
    if (!settings) {
        settings = await SystemSettings.create({
            systemName: "MarianResearch Portal",
            organization: "Marian College Kuttikkanam",
            timezone: "GMT+05:30",
            dateFormat: "dd/mm/yyyy",
        });
    }
    res.json({ item: settings });
});
// Update global system settings
const updateSettings = asyncHandler(async (req, res) => {
    const updates = { ...req.body };
    delete updates._id;
    const settings = await SystemSettings.findOneAndUpdate({}, updates, {
        new: true,
        upsert: true,
        runValidators: true,
    });
    res.json({ item: settings });
});
// Clear entire database (admin only)
const clearDatabase = asyncHandler(async (req, res) => {
    // We assume that the route is protected by `authorizeRoles('admin')` middleware.
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany();
    }
    res.json({ message: "Database cleared successfully" });
});
module.exports = {
    get: getSettings,
    update: updateSettings,
    clearDatabase: clearDatabase,
};
