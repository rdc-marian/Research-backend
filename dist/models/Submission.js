"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const SubmissionSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true, trim: true },
    abstract: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    scholar: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    supervisor: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
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
    reviewer: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
    reviewNote: String,
    reviewedAt: Date,
}, { timestamps: true });
module.exports = mongoose_1.default.model("Submission", SubmissionSchema);
