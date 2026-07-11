"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const IncentiveSchema = new mongoose_1.default.Schema({
    faculty: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    facultyName: {
        type: String,
        required: true,
        trim: true,
    },
    facultyEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    category: {
        type: String,
        enum: ["Publication", "Patent", "Registration Fee"],
        required: true,
    },
    amountRequested: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: [
            "Pending Library",
            "Pending Guide",
            "Pending Admin",
            "Pending Principal",
            "Approved",
            "Paid",
            "Rejected",
        ],
        default: "Pending Library",
    },
    // Publication category details
    publicationTitle: { type: String, trim: true },
    journalName: { type: String, trim: true },
    doiLink: { type: String, trim: true },
    pubStatus: { type: String, trim: true }, // Accepted / Published
    // Patent category details
    patentTitle: { type: String, trim: true },
    patentNumber: { type: String, trim: true },
    patentStatus: { type: String, trim: true }, // Filed / Published / Granted
    // Registration fee category details
    eventName: { type: String, trim: true },
    eventType: { type: String, trim: true }, // Conference, Workshop, FDP, Seminar, etc.
    proofImage: { type: String }, // Base64 proof string
    // Reviewer details & notes
    libraryNote: { type: String },
    guideNote: { type: String },
    adminNote: { type: String },
    principalNote: { type: String },
    reviewedBy: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }],
    dateApplied: { type: Date, default: Date.now },
}, { timestamps: true });
module.exports = mongoose_1.default.model("Incentive", IncentiveSchema);
