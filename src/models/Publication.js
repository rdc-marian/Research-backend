"use strict";

const mongoose = require("mongoose");
const PublicationSchema = new mongoose.Schema({
    scholar: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    authors: { type: String, required: true, trim: true },
    journalName: { type: String, required: true, trim: true },
    volume: { type: String, trim: true },
    issue: { type: String, trim: true },
    pages: { type: String, trim: true },
    issnIsbn: { type: String, trim: true },
    publishDate: { type: Date, required: true },
    impactFactor: { type: Number },
    indexing: {
        type: [String],
        enum: ["Scopus", "Web of Science", "UGC CARE", "Other"],
        default: ["Other"],
    },
    publicationUrl: { type: String, trim: true },
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
module.exports = mongoose.model("Publication", PublicationSchema);
