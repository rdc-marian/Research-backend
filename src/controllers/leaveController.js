"use strict";

const LeaveApplication = require("../models/LeaveApplication");
const User = require("../models/User");
const { asyncHandler } = require("../utils/asyncHandler");

// Get all leave applications with strict role-based access control
const getAll = asyncHandler(async (req, res) => {
    const { scholarId, status, researchCenterId, guideId } = req.query;
    const query = {};
    const requester = req.user;

    if (!requester) {
        return res.status(401).json({ message: "Authentication required" });
    }

    const requesterRoles = requester.roles || [requester.role];
    const isAdmin = requesterRoles.includes("admin");
    const isGuide = requesterRoles.includes("research_guide") || requester.role === "research_guide" || (requester.permissions && requester.permissions.includes("research_guide")) || requesterRoles.includes("faculty");
    const isCoordinator = requesterRoles.includes("coordinator") || requester.role === "coordinator" || (requester.permissions && requester.permissions.includes("coordinator"));
    const isScholar = requesterRoles.includes("scholar");

    if (isAdmin) {
        // Admin can view all or filter
        if (scholarId) query.scholar = scholarId;
        if (researchCenterId || guideId) {
            const scholarQuery = { $or: [{ role: "scholar" }, { roles: "scholar" }] };
            if (researchCenterId) scholarQuery.researchCenter = researchCenterId;
            if (guideId) scholarQuery.guide = guideId;
            const scholars = await User.find(scholarQuery).select("_id");
            query.scholar = { $in: scholars.map((item) => item._id) };
        }
    } else if (isGuide) {
        // Guide can ONLY view leave applications of scholars assigned to them
        const myScholars = await User.find({ guide: requester.userId }).select("_id");
        query.scholar = { $in: myScholars.map((s) => s._id) };
    } else if (isCoordinator) {
        // Research center coordinators do not manage scholar leaves
        return res.status(403).json({ message: "Access denied: Research center coordinators do not manage scholar leaves." });
    } else if (isScholar) {
        // Scholar can ONLY view their own leave applications
        query.scholar = requester.userId;
    } else {
        return res.status(403).json({ message: "Access denied" });
    }

    if (status) {
        query.status = status;
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

// Get a single leave application with authorization check
const getOne = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const requester = req.user;

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

    if (requester) {
        const requesterRoles = requester.roles || [requester.role];
        const isAdmin = requesterRoles.includes("admin");
        const isGuide = requester.permissions && requester.permissions.includes("research_guide");
        const isCoordinator = requester.permissions && requester.permissions.includes("coordinator");
        const isScholar = requesterRoles.includes("scholar");

        if (isScholar && leave.scholar._id.toString() !== requester.userId) {
            return res.status(403).json({ message: "Access denied" });
        }
        if (isGuide && !isAdmin && leave.scholar.guide?._id?.toString() !== requester.userId && leave.scholar.guide?.toString() !== requester.userId) {
            return res.status(403).json({ message: "Access denied: Not your scholar" });
        }
        if (isCoordinator && !isAdmin && leave.scholar.researchCenter?._id?.toString() !== requester.researchCenter?.toString()) {
            return res.status(403).json({ message: "Access denied: Not in your research center" });
        }
    }

    res.json({ item: leave });
});

// Apply for leave (supports document upload)
const create = asyncHandler(async (req, res) => {
    const requester = req.user;
    if (!requester) {
        return res.status(401).json({ message: "Authentication required" });
    }

    const requesterRoles = requester.roles || [requester.role];
    const isScholar = requesterRoles.includes("scholar");

    // Derive scholarId from authenticated user if scholar, otherwise check req.body.scholarId
    const scholarId = isScholar ? requester.userId : (req.body.scholarId || requester.userId);
    const { leaveType, startDate, endDate, totalDays, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !totalDays || !reason) {
        return res.status(400).json({ message: "leaveType, startDate, endDate, totalDays, and reason are required" });
    }

    // Verify scholar exists and has an assigned Research Guide
    const scholarUser = await User.findById(scholarId);
    if (!scholarUser) {
        return res.status(404).json({ message: "Scholar user not found" });
    }

    if (!scholarUser.guide) {
        return res.status(400).json({ message: "Scholar does not have an assigned Research Guide. Please contact administration." });
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
    const requester = req.user;

    const existing = await LeaveApplication.findById(id);
    if (!existing) {
        return res.status(404).json({ message: "Leave application not found" });
    }

    if (requester) {
        const requesterRoles = requester.roles || [requester.role];
        const isAdmin = requesterRoles.includes("admin");
        if (!isAdmin && existing.scholar.toString() !== requester.userId) {
            return res.status(403).json({ message: "Access denied" });
        }
    }

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
    if (updates.startDate) updates.startDate = new Date(updates.startDate);
    if (updates.endDate) updates.endDate = new Date(updates.endDate);
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

    res.json({ item: leave });
});

// Delete a leave application
const deleteLeave = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const requester = req.user;

    const existing = await LeaveApplication.findById(id);
    if (!existing) {
        return res.status(404).json({ message: "Leave application not found" });
    }

    if (requester) {
        const requesterRoles = requester.roles || [requester.role];
        const isAdmin = requesterRoles.includes("admin");
        if (!isAdmin && existing.scholar.toString() !== requester.userId) {
            return res.status(403).json({ message: "Access denied" });
        }
    }

    await LeaveApplication.findByIdAndDelete(id);
    res.json({ message: "Success" });
});

// Update status of leave (approved/rejected)
const updateStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, note } = req.body;
    const requester = req.user;

    if (!requester) {
        return res.status(401).json({ message: "Authentication required" });
    }

    if (!status) {
        return res.status(400).json({ message: "status is required" });
    }

    const allowedStatuses = ["Pending", "ApprovedByGuide", "ApprovedByCoordinator", "Rejected"];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
    }

    const leaveTarget = await LeaveApplication.findById(id).populate({
        path: "scholar",
        select: "name email researchCenter guide",
    });

    if (!leaveTarget) {
        return res.status(404).json({ message: "Leave application not found" });
    }

    const requesterRoles = requester.roles || [requester.role];
    const isAdmin = requesterRoles.includes("admin");
    const isGuide = requesterRoles.includes("research_guide") || requester.role === "research_guide" || (requester.permissions && requester.permissions.includes("research_guide")) || requesterRoles.includes("faculty");
    const isCoordinator = requesterRoles.includes("coordinator") || requester.role === "coordinator" || (requester.permissions && requester.permissions.includes("coordinator"));

    // Authorization check: Guide vs Coordinator vs Admin
    if (status === "ApprovedByGuide" || status === "Rejected") {
        const guideId = leaveTarget.scholar?.guide?.toString() || leaveTarget.scholar?.guide?._id?.toString();
        if (!isAdmin && (!isGuide || guideId !== requester.userId)) {
            return res.status(403).json({ message: "Access denied: You can only review leave requests from your own assigned scholars." });
        }
    } else if (status === "ApprovedByCoordinator") {
        return res.status(400).json({ message: "Research center leave approvals are disabled." });
    }

    const updates = {
        status,
        verifiedBy: requester.userId,
        verifiedAt: status === "Pending" ? null : new Date(),
    };

    if (status === "ApprovedByGuide" || status === "Rejected") {
        updates.guideNote = note;
    } else if (status === "ApprovedByCoordinator") {
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
