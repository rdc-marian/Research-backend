"use strict";

const mongoose = require("mongoose");
const DepartmentActivitySchema = new mongoose.Schema({
    department: { type: String, required: true, trim: true },
    type: {
        type: String,
        enum: ["Event", "FDP", "Workshop", "MoU", "Collaborative Activity", "Industry Interaction", "Other"],
        required: true
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    participantsCount: { type: Number },
    outcomes: { type: String, trim: true },
    document: {
        url: String,
        publicId: String,
        originalName: String,
        mimeType: String,
        size: Number,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });
module.exports = mongoose.model("DepartmentActivity", DepartmentActivitySchema);
