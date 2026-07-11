"use strict";

const mongoose = require("mongoose");
const ScholarProgressSchema = new mongoose.Schema({
    scholar: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    guide: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
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
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });
module.exports = mongoose.model("ScholarProgress", ScholarProgressSchema);
