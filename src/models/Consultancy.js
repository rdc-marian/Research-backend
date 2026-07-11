"use strict";

const mongoose = require("mongoose");
const ConsultancySchema = new mongoose.Schema({
    scholar: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    clientOrganization: { type: String, required: true, trim: true },
    consultancyArea: { type: String, required: true, trim: true },
    durationMonths: { type: Number },
    revenueGenerated: { type: Number },
    outcomes: { type: String, trim: true },
    startDate: { type: Date },
    endDate: { type: Date },
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
module.exports = mongoose.model("Consultancy", ConsultancySchema);
