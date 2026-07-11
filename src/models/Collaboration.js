"use strict";

const mongoose = require("mongoose");
const CollaborationSchema = new mongoose.Schema({
    scholar: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    collaborationType: { type: String, enum: ["National", "International"], required: true },
    partnerInstitution: { type: String, required: true, trim: true },
    partnerName: { type: String, trim: true }, // name of collaborating researcher if applicable
    purpose: { type: String, trim: true }, // e.g., Joint Publication, Joint Project, MoU
    details: { type: String, trim: true },
    startDate: { type: Date },
    endDate: { type: Date },
    status: { type: String, enum: ["Active", "Completed"], default: "Active" },
    document: {
        url: String,
        publicId: String,
        originalName: String,
        mimeType: String,
        size: Number,
    },
    verificationStatus: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending",
    },
    guideNote: String,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    verifiedAt: Date,
}, { timestamps: true });
module.exports = mongoose.model("Collaboration", CollaborationSchema);
