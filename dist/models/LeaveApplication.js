"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const LeaveApplicationSchema = new mongoose_1.default.Schema({
    scholar: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    leaveType: {
        type: String,
        enum: ["Casual Leave", "Duty Leave", "Sick Leave", "Maternity Leave", "Other"],
        required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalDays: { type: Number, required: true },
    reason: { type: String, required: true, trim: true },
    document: {
        url: String,
        publicId: String,
        originalName: String,
        mimeType: String,
        size: Number,
    },
    status: {
        type: String,
        enum: ["Pending", "ApprovedByGuide", "ApprovedByCoordinator", "Rejected"],
        default: "Pending",
    },
    guideNote: String,
    coordinatorNote: String,
    verifiedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
    verifiedAt: Date,
}, { timestamps: true });
module.exports = mongoose_1.default.model("LeaveApplication", LeaveApplicationSchema);
