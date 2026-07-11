"use strict";

const mongoose = require("mongoose");
const ScholarshipSchema = new mongoose.Schema({
    scholar: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true }, // fellowship / stipend name
    sponsoringAgency: { type: String, required: true, trim: true },
    amountPerMonth: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    scholarshipStatus: {
        type: String,
        enum: ["Active", "Completed", "Terminated"],
        default: "Active",
    },
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
module.exports = mongoose.model("Scholarship", ScholarshipSchema);
