"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ResearchCenterSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true, trim: true, unique: true },
    code: { type: String, required: true, trim: true, uppercase: true, unique: true },
    coordinator: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
    department: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Department" },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
}, { timestamps: true });
module.exports = mongoose_1.default.model("ResearchCenter", ResearchCenterSchema);
