"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ScholarshipSchema = new mongoose_1.default.Schema({
    scholar: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true }, // fellowship / stipend name
    sponsoringAgency: { type: String, required: true, trim: true },
    amountPerMonth: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    scholarshipStatus: {
        type: String,
        enum: ["Active", "Completed", "Terminated"],
        default: "Active",
    },
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
module.exports = mongoose_1.default.model("Scholarship", ScholarshipSchema);
