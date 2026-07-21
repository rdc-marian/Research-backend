"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Incentive = require("../models/Incentive");
const { asyncHandler } = require("../utils/asyncHandler");
// Retrieve all incentive applications with optional filters
const getAll = asyncHandler(async (req, res) => {
    const { facultyEmail, status } = req.query;
    const query = {};
    if (facultyEmail)
        query.facultyEmail = facultyEmail;
    if (status)
        query.status = status;
    const incentives = await Incentive.find(query)
        .populate("faculty", "name email researchCenter avatar department uniqueId role roles")
        .sort({ createdAt: -1 });
    res.json({ items: incentives });
});
// Submit a new research incentive application
const create = asyncHandler(async (req, res) => {
    const { category, amountRequested, publicationTitle, journalName, doiLink, pubStatus, patentTitle, patentNumber, patentStatus, eventName, eventType, proofImage, } = req.body;
    const facultyId = req.user.userId;
    const facultyName = req.user.name || "Faculty Member";
    // Find logged-in user email or get from user model
    const User = require("../models/User");
    const user = await User.findById(facultyId);
    if (!user) {
        return res.status(404).json({ message: "Faculty user not found" });
    }
    const incentive = new Incentive({
        faculty: facultyId,
        facultyName: user.name,
        facultyEmail: user.email,
        category,
        amountRequested: Number(amountRequested),
        status: "Pending Library", // Initial status workflow starts here
        publicationTitle,
        journalName,
        doiLink,
        pubStatus,
        patentTitle,
        patentNumber,
        patentStatus,
        eventName,
        eventType,
        proofImage,
    });
    await incentive.save();
    res.status(201).json({ item: incentive });
});
// Update the workflow status of an incentive application
const updateStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, note, reviewerId } = req.body;
    if (!status) {
        return res.status(400).json({ message: "status is required" });
    }
    const allowedStatuses = [
        "Pending Library",
        "Pending Guide",
        "Pending Admin",
        "Pending Principal",
        "Approved",
        "Paid",
        "Rejected",
    ];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: `Invalid workflow status: ${status}` });
    }
    const updates = {
        status,
    };
    // Set the specific reviewer note depending on the stage of the workflow
    if (note) {
        const currentIncentive = await Incentive.findById(id);
        if (!currentIncentive) {
            return res.status(404).json({ message: "Incentive application not found" });
        }
        const currentStatus = currentIncentive.status;
        if (currentStatus === "Pending Library") {
            updates.libraryNote = note;
        }
        else if (currentStatus === "Pending Guide") {
            updates.guideNote = note;
        }
        else if (currentStatus === "Pending Admin") {
            updates.adminNote = note;
        }
        else if (currentStatus === "Pending Principal") {
            updates.principalNote = note;
        }
    }
    if (reviewerId) {
        updates.$addToSet = { reviewedBy: reviewerId };
    }
    const updatedIncentive = await Incentive.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
    }).populate("faculty", "name email department");
    if (!updatedIncentive) {
        return res.status(404).json({ message: "Incentive application not found" });
    }
    res.json({ item: updatedIncentive });
});
// Delete an incentive record
const deleteIncentive = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deletedIncentive = await Incentive.findByIdAndDelete(id);
    if (!deletedIncentive) {
        return res.status(404).json({ message: "Incentive application not found" });
    }
    res.json({ message: "Incentive application deleted successfully" });
});

module.exports = {
    getAll,
    create,
    updateStatus,
    deleteIncentive,
};
