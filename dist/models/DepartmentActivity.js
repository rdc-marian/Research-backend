"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const DepartmentActivitySchema = new mongoose_1.default.Schema({
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
    createdBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });
module.exports = mongoose_1.default.model("DepartmentActivity", DepartmentActivitySchema);
