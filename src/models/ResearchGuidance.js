"use strict";

const mongoose = require("mongoose");
const ResearchGuidanceSchema = new mongoose.Schema({
    scholar: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // The faculty/guide who is guiding
    guidanceType: { type: String, enum: ["PhD", "UG_PG"], required: true },
    studentName: { type: String, required: true, trim: true },
    registrationNumber: { type: String, trim: true },
    researchTitle: { type: String, trim: true },
    status: { type: String, enum: ["Ongoing", "Completed", "Awarded"], default: "Ongoing" },
    registrationYear: { type: Number },
    academicYear: { type: String, trim: true }, // e.g. 2023-2024 for UG/PG
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
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    verifiedAt: Date,
}, { timestamps: true });
module.exports = mongoose.model("ResearchGuidance", ResearchGuidanceSchema);
