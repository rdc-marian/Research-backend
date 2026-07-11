"use strict";

const mongoose = require("mongoose");
const ConferenceSchema = new mongoose.Schema({
    scholar: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true }, // Conference Title
    paperTitle: { type: String, trim: true }, // Title of presented paper (optional)
    presentationType: {
        type: String,
        enum: ["Oral", "Poster", "Attended Only", "Keynote"],
        default: "Attended Only",
    },
    organizer: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    proceedingsDetails: { type: String, trim: true },
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
module.exports = mongoose.model("Conference", ConferenceSchema);
