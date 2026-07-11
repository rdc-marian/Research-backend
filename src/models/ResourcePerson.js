"use strict";

const mongoose = require("mongoose");
const ResourcePersonSchema = new mongoose.Schema({
    scholar: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    topic: { type: String, required: true, trim: true },
    institution: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    eventType: { type: String, trim: true }, // Conference, Workshop, etc.
    participantCount: { type: Number },
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
module.exports = mongoose.model("ResourcePerson", ResourcePersonSchema);
