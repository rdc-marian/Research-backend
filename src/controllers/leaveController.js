"use strict";

const LeaveApplication = require("../models/LeaveApplication");
const User = require("../models/User");
const { asyncHandler } = require("../utils/asyncHandler");
// Get all leave applications with optional filtering
const getAll = asyncHandler(async (req, res) => {
    const { scholarId, status, researchCenterId, guideId } = req.query;
    const query = {};
    if (scholarId)
        query.scholar = scholarId;
    if (status)
        query.status = status;
    if (researchCenterId || guideId) {
        const scholarQuery = { $or: [{ role: "scholar" }, { roles: "scholar" }],
        };
        if (researchCenterId)
            scholarQuery.researchCenter = researchCenterId;
        if (guideId)
            scholarQuery.guide = guideId;
        const scholars = await User.find(scholarQuery).select("_id");
        query.scholar = { $in: scholars.map((item) => item._id) };
    }
    const leaves = await LeaveApplication.find(query)
        .populate({
            path: "scholar",
            select: "name email researchCenter guide",
            populate: [
                { path: "researchCenter", select: "name code" },
                { path: "guide", select: "name email" },
            ],
        })
        .populate("verifiedBy", "name email")
        .sort({ createdAt: -1 });
    res.json({ items: leaves });
});
// Get a single leave application
const getOne = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const leave = await LeaveApplication.findById(id)
        .populate({
            path: "scholar",
            select: "name email researchCenter guide",
            populate: [
                { path: "researchCenter", select: "name code" },
                { path: "guide", select: "name email" },
            ],
        })
        .populate("verifiedBy", "name email");
    if (!leave) {
        return res.status(404).json({ message: "Leave application not found" });
    }
    res.json({ item: leave });
});
// Apply for leave (supports document upload)
const create = asyncHandler(async (req, res) => {
    const { scholarId, leaveType, startDate, endDate, totalDays, reason } = req.body;
    if (!scholarId || !leaveType || !startDate || !endDate || !totalDays || !reason) {
        return res.status(400).json({ message: "scholarId, leaveType, startDate, endDate, totalDays, and reason are required" });
    }
    let fileData;
    if (req.file) {
        fileData = {
            url: `/api/uploads/${Date.now()}-${req.file.originalname}`,
            publicId: `${Date.now()}-${req.file.originalname}`,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
        };
    }
    const leave = await LeaveApplication.create({
        scholar: scholarId,
        leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalDays: Number(totalDays),
        reason,
        document: fileData,
        status: "Pending",
    });
    const populated = await LeaveApplication.findById(leave._id)
        .populate({
            path: "scholar",
            select: "name email researchCenter guide",
            populate: [
                { path: "researchCenter", select: "name code" },
                { path: "guide", select: "name email" },
            ],
        });
    res.status(201).json({ item: populated });
});
// Update a leave application (supports document upload)
const update = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = { ...req.body };
    if (req.file) {
        updates.document = {
            url: `/api/uploads/${Date.now()}-${req.file.originalname}`,
            publicId: `${Date.now()}-${req.file.originalname}`,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
        };
    }
    if (updates.startDate)
        updates.startDate = new Date(updates.startDate);
    if (updates.endDate)
        updates.endDate = new Date(updates.endDate);
    if (updates.totalDays !== undefined) {
        updates.totalDays = updates.totalDays ? Number(updates.totalDays) : undefined;
    }
    // Reset status back to pending when user updates it
    updates.status = "Pending";
    updates.verifiedBy = undefined;
    updates.verifiedAt = undefined;
    const leave = await LeaveApplication.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
    }).populate({
        path: "scholar",
        select: "name email researchCenter guide",
        populate: [
            { path: "researchCenter", select: "name code" },
            { path: "guide", select: "name email" },
        ],
    });
    if (!leave) {
        return res.status(404).json({ message: "Leave application not found" });
    }
    res.json({ item: leave });
});
// Delete a leave application
const deleteLeave = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const leave = await LeaveApplication.findByIdAndDelete(id);
    if (!leave) {
        return res.status(404).json({ message: "Leave application not found" });
    }
    res.json({ message: "Success" });
});
// Update status of leave (approved/rejected)
const updateStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, reviewerId, note } = req.body;
    if (!status) {
        return res.status(400).json({ message: "status is required" });
    }
    const allowedStatuses = ["Pending", "ApprovedByGuide", "ApprovedByCoordinator", "Rejected"];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
    }
    const updates = {
        status,
        verifiedBy: reviewerId || undefined,
        verifiedAt: status === "Pending" ? null : new Date(),
    };
    if (status === "ApprovedByGuide" || status === "Rejected") {
        updates.guideNote = note;
    }
    else if (status === "ApprovedByCoordinator") {
        updates.coordinatorNote = note;
    }
    const leave = await LeaveApplication.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
    })
        .populate({
            path: "scholar",
            select: "name email researchCenter guide",
            populate: [
                { path: "researchCenter", select: "name code" },
                { path: "guide", select: "name email" },
            ],
        })
        .populate("verifiedBy", "name email");
    if (!leave) {
        return res.status(404).json({ message: "Leave application not found" });
    }
    res.json({ item: leave });
});
module.exports = {
    getAll,
    getOne,
    create,
    update,
    delete: deleteLeave,
    updateStatus,
};
