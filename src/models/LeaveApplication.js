"use strict";

const mongoose = require("mongoose");
const LeaveApplicationSchema = new mongoose.Schema({
    scholar: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    leaveType: {
        type: String,
        enum: ["Casual Leave", "Duty Leave", "Sick Leave", "Maternity Leave", "Other"],
        required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalDays: { type: Number, required: true },
    reason: { type: String, required: true, trim: true },
    document: {
        url: String,
        publicId: String,
        originalName: String,
        mimeType: String,
        size: Number,
    },
    status: {
        type: String,
        enum: ["Pending", "ApprovedByGuide", "ApprovedByCoordinator", "Rejected"],
        default: "Pending",
    },
    guideNote: String,
    coordinatorNote: String,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    verifiedAt: Date,
}, { timestamps: true });

LeaveApplicationSchema.index({ scholar: 1, status: 1 });
LeaveApplicationSchema.index({ scholar: 1, createdAt: -1 });

module.exports = mongoose.model("LeaveApplication", LeaveApplicationSchema);
