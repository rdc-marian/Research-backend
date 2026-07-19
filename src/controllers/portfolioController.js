"use strict";

const Qualification = require("../models/Qualification");
const Publication = require("../models/Publication");
const Conference = require("../models/Conference");
const Patent = require("../models/Patent");
const Workshop = require("../models/Workshop");
const Membership = require("../models/Membership");
const Scholarship = require("../models/Scholarship");
const LeaveApplication = require("../models/LeaveApplication");
const User = require("../models/User");
const { asyncHandler } = require("../utils/asyncHandler");
// Get portfolio item summary counts (Total, Pending, Approved, Rejected) for a scholar
const getSummary = asyncHandler(async (req, res) => {
    const { scholarId, researchCenterId, guideId } = req.query;
    let scholarsList = [];
    if (scholarId) {
        scholarsList = [scholarId];
    }
    else if (researchCenterId || guideId) {
        const scholarQuery = { $or: [{ role: "scholar" }, { roles: "scholar" }],
        };
        if (researchCenterId)
            scholarQuery.researchCenter = researchCenterId;
        if (guideId)
            scholarQuery.guide = guideId;
        const users = await User.find(scholarQuery).select("_id");
        scholarsList = users.map((u) => u._id);
    }
    else {
        // All scholars
        const users = await User.find({ $or: [{ role: "scholar" }, { roles: "scholar" }] }).select("_id");
        scholarsList = users.map((u) => u._id);
    }
    const query = { scholar: { $in: scholarsList } };
    const [qualifications, publications, conferences, patents, workshops, memberships, scholarships, leaves,] = await Promise.all([
        Qualification.find(query).select("verificationStatus"),
        Publication.find(query).select("verificationStatus"),
        Conference.find(query).select("verificationStatus"),
        Patent.find(query).select("verificationStatus"),
        Workshop.find(query).select("verificationStatus"),
        Membership.find(query).select("verificationStatus"),
        Scholarship.find(query).select("verificationStatus"),
        LeaveApplication.find(query).select("status"),
    ]);
    const getStatusCounts = (items, statusField = "verificationStatus") => {
        const counts = { Pending: 0, Approved: 0, Rejected: 0 };
        items.forEach((item) => {
            const val = item[statusField];
            if (val === "Approved" || val === "ApprovedByGuide" || val === "ApprovedByCoordinator") {
                counts.Approved++;
            }
            else if (val === "Rejected") {
                counts.Rejected++;
            }
            else {
                counts.Pending++;
            }
        });
        return { total: items.length, ...counts };
    };
    res.json({
        summary: {
            qualifications: getStatusCounts(qualifications),
            publications: getStatusCounts(publications),
            conferences: getStatusCounts(conferences),
            patents: getStatusCounts(patents),
            workshops: getStatusCounts(workshops),
            memberships: getStatusCounts(memberships),
            scholarships: getStatusCounts(scholarships),
            leaves: getStatusCounts(leaves, "status"),
        },
    });
});
// Get all pending approvals across all portfolio categories for a guide's scholars
const getApprovals = asyncHandler(async (req, res) => {
    const { guideId, researchCenterId } = req.query;
    const scholarQuery = { $or: [{ role: "scholar" }, { roles: "scholar" }],
    };
    if (guideId)
        scholarQuery.guide = guideId;
    if (researchCenterId)
        scholarQuery.researchCenter = researchCenterId;
    const scholars = await User.find(scholarQuery).select("_id");
    const scholarIds = scholars.map((item) => item._id);
    const query = { scholar: { $in: scholarIds }, verificationStatus: "Pending" };
    const leaveQuery = { scholar: { $in: scholarIds }, status: "Pending" };
    const scholarPopulate = {
        path: "scholar",
        select: "name email researchCenter guide",
        populate: [
            { path: "researchCenter", select: "name code" },
            { path: "guide", select: "name email" }
        ]
    };
    const [qualifications, publications, conferences, patents, workshops, memberships, scholarships, leaves,] = await Promise.all([
        Qualification.find(query).populate(scholarPopulate),
        Publication.find(query).populate(scholarPopulate),
        Conference.find(query).populate(scholarPopulate),
        Patent.find(query).populate(scholarPopulate),
        Workshop.find(query).populate(scholarPopulate),
        Membership.find(query).populate(scholarPopulate),
        Scholarship.find(query).populate(scholarPopulate),
        LeaveApplication.find(leaveQuery).populate(scholarPopulate),
    ]);
    const allApprovals = [
        ...qualifications.map((item) => ({ ...item.toObject(), category: "qualification" })),
        ...publications.map((item) => ({ ...item.toObject(), category: "publication" })),
        ...conferences.map((item) => ({ ...item.toObject(), category: "conference" })),
        ...patents.map((item) => ({ ...item.toObject(), category: "patent" })),
        ...workshops.map((item) => ({ ...item.toObject(), category: "workshop" })),
        ...memberships.map((item) => ({ ...item.toObject(), category: "membership" })),
        ...scholarships.map((item) => ({ ...item.toObject(), category: "scholarship" })),
        ...leaves.map((item) => ({ ...item.toObject(), category: "leave" })),
    ];
    // Sort by creation date descending
    allApprovals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ items: allApprovals });
});
module.exports = {
    getSummary,
    getApprovals,
};
