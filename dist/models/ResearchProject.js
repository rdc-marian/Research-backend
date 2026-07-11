"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ResearchProjectSchema = new mongoose_1.default.Schema({
    scholar: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    fundingAgency: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    durationMonths: { type: Number },
    role: { type: String, enum: ["PI", "Co-PI", "Other"], default: "PI" },
    status: { type: String, enum: ["Ongoing", "Completed"], default: "Ongoing" },
    startDate: { type: Date },
    endDate: { type: Date }, // expected completion for ongoing
    outcomes: { type: String, trim: true },
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
    verifiedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
    verifiedAt: Date,
}, { timestamps: true });
module.exports = mongoose_1.default.model("ResearchProject", ResearchProjectSchema);
