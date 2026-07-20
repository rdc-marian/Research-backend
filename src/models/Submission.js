"use strict";

const mongoose = require("mongoose");
const SubmissionSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    abstract: { type: String, required: true, trim: true },
    scholar: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    supervisor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected", "In Review"],
        default: "Pending",
    },
    submittedAt: { type: Date, default: Date.now },
    file: {
        url: String,
        publicId: String,
        originalName: String,
        mimeType: String,
        size: Number,
    },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewNote: String,
    reviewedAt: Date,
}, { timestamps: true });

SubmissionSchema.index({ scholar: 1, status: 1 });
SubmissionSchema.index({ scholar: 1, submittedAt: -1 });
SubmissionSchema.index({ supervisor: 1 });

module.exports = mongoose.model("Submission", SubmissionSchema);
