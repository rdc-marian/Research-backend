"use strict";

const mongoose = require("mongoose");
const AwardSchema = new mongoose.Schema({
    scholar: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    awardName: { type: String, required: true, trim: true },
    organization: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    category: { type: String, trim: true }, // e.g. National, International, State
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
module.exports = mongoose.model("Award", AwardSchema);
