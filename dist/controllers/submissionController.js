"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Submission = require("../models/Submission");
const User = require("../models/User");
const { asyncHandler } = require("../utils/asyncHandler");
// Helper to parse dates
const parseDate = (value) => {
    if (!value)
        return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};
// Helper to build submissions search query
const buildSubmissionQuery = async (params) => {
    const query = {};
    if (params.status)
        query.status = params.status;
    if (params.department)
        query.department = params.department;
    if (params.scholarId) {
        query.scholar = params.scholarId;
    }
    else if (params.guideId || params.researchCenterId) {
        const scholarQuery = { $or: [{ role: "scholar" }, { roles: "scholar" }],
        };
        if (params.guideId)
            scholarQuery.guide = params.guideId;
        if (params.researchCenterId)
            scholarQuery.researchCenter = params.researchCenterId;
        const scholars = await User.find(scholarQuery).select("_id");
        query.scholar = { $in: scholars.map((item) => item._id) };
    }
    if (params.supervisorId)
        query.supervisor = params.supervisorId;
    if (params.search) {
        const regex = new RegExp(params.search, "i");
        query.$or = [{ title: regex }, { abstract: regex }];
    }
    const fromDate = parseDate(params.from);
    const toDate = parseDate(params.to);
    if (fromDate || toDate) {
        query.submittedAt = {};
        if (fromDate)
            query.submittedAt.$gte = fromDate;
        if (toDate)
            query.submittedAt.$lte = toDate;
    }
    return query;
};
// Get all submissions with filters
const getAll = asyncHandler(async (req, res) => {
    const query = await buildSubmissionQuery(req.query);
    const submissions = await Submission.find(query)
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
    res.json({ items: submissions });
});
// Get a single submission
const getOne = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const submission = await Submission.findById(id)
        .populate({
        path: "scholar",
        select: "name email researchCenter guide",
        populate: [
            { path: "researchCenter", select: "name code" },
            { path: "guide", select: "name email" },
        ],
    })
        .populate("supervisor", "name email")
        .populate("reviewer", "name email");
    if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
    }
    res.json({ item: submission });
});
// Create a new submission (supports file upload)
const create = asyncHandler(async (req, res) => {
    const { title, abstract, department, scholarId, supervisorId } = req.body;
    if (!title || !abstract || !department || !scholarId) {
        return res.status(400).json({ message: "title, abstract, department, and scholarId are required" });
    }
    let fileData;
    if (req.file) {
        // For MVP, store local file metadata
        fileData = {
            url: `/api/uploads/${Date.now()}-${req.file.originalname}`,
            publicId: `${Date.now()}-${req.file.originalname}`,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
        };
    }
    const submission = await Submission.create({
        title,
        abstract,
        department,
        scholar: scholarId,
        supervisor: supervisorId || undefined,
        file: fileData,
        submittedAt: new Date(),
    });
    const populated = await Submission.findById(submission._id)
        .populate({
        path: "scholar",
        select: "name email researchCenter guide",
        populate: [
            { path: "researchCenter", select: "name code" },
            { path: "guide", select: "name email" },
        ],
    })
        .populate("supervisor", "name email");
    res.status(201).json({ item: populated });
});
// Update a submission
const update = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, abstract, department, scholarId, supervisorId } = req.body;
    const updates = {};
    if (title !== undefined)
        updates.title = title;
    if (abstract !== undefined)
        updates.abstract = abstract;
    if (department !== undefined)
        updates.department = department;
    if (scholarId !== undefined)
        updates.scholar = scholarId;
    if (supervisorId !== undefined) {
        updates.supervisor = supervisorId || undefined;
    }
    if (req.file) {
        updates.file = {
            url: `/api/uploads/${Date.now()}-${req.file.originalname}`,
            publicId: `${Date.now()}-${req.file.originalname}`,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
        };
    }
    const submission = await Submission.findByIdAndUpdate(id, updates, {
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
        .populate("supervisor", "name email")
        .populate("reviewer", "name email");
    if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
    }
    res.json({ item: submission });
});
// Update status of a submission
const updateStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, reviewerId, note } = req.body;
    if (!status) {
        return res.status(400).json({ message: "status is required" });
    }
    const allowedStatuses = ["Pending", "Approved", "Rejected", "In Review"];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
    }
    const updates = {
        status,
        reviewNote: note,
        reviewer: reviewerId || undefined,
        reviewedAt: status === "Pending" ? null : new Date(),
    };
    const submission = await Submission.findByIdAndUpdate(id, updates, {
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
        .populate("supervisor", "name email")
        .populate("reviewer", "name email");
    if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
    }
    res.json({ item: submission });
});
// Delete a submission
const deleteSubmission = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const submission = await Submission.findByIdAndDelete(id);
    if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
    }
    res.json({ message: "Success" });
});
module.exports = {
    getAll,
    getOne,
    create,
    update,
    updateStatus,
    delete: deleteSubmission,
};
