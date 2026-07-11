"use strict";

const mongoose = require("mongoose");
const ResearchGrantSchema = new mongoose.Schema({
    scholar: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fundingAgency: { type: String, required: true, trim: true },
    schemeName: { type: String, trim: true },
    amount: { type: Number, required: true },
    year: { type: Number, required: true },
    purpose: { type: String, trim: true },
    utilizationStatus: { type: String, trim: true }, // e.g. Fully Utilized, Ongoing
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
module.exports = mongoose.model("ResearchGrant", ResearchGrantSchema);
