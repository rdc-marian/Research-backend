"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ScholarProgressSchema = new mongoose_1.default.Schema({
    scholar: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    guide: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    admissionDetails: {
        registrationDate: Date,
        registrationNumber: String,
        admissionType: { type: String, enum: ["Full Time", "Part Time"] },
    },
    courseworkCompletion: {
        status: { type: String, enum: ["Pending", "Completed"], default: "Pending" },
        completionDate: Date,
    },
    dcMeetings: [
        {
            meetingNumber: Number,
            date: Date,
            remarks: String,
            document: {
                url: String,
                publicId: String,
                originalName: String,
            }
        }
    ],
    synopsisSubmission: {
        status: { type: String, enum: ["Not Submitted", "Submitted", "Approved"], default: "Not Submitted" },
        date: Date,
    },
    thesisSubmission: {
        status: { type: String, enum: ["Not Submitted", "Submitted", "Evaluated"], default: "Not Submitted" },
        date: Date,
    },
    vivaVoceStatus: {
        status: { type: String, enum: ["Pending", "Scheduled", "Completed"], default: "Pending" },
        date: Date,
    },
    lastUpdatedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });
module.exports = mongoose_1.default.model("ScholarProgress", ScholarProgressSchema);
