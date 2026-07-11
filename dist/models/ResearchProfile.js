"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ResearchProfileSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    facultyId: { type: String, trim: true }, // Employee ID / Scholar ID
    designation: { type: String, trim: true },
    dateOfJoining: { type: Date },
    // Identifiers
    orcidId: { type: String, trim: true },
    scopusId: { type: String, trim: true },
    wosId: { type: String, trim: true }, // Web of Science Researcher ID
    googleScholarLink: { type: String, trim: true },
    linkedInLink: { type: String, trim: true },
    academicWebsite: { type: String, trim: true },
    // Profile Image
    profileImageUrl: { type: String, trim: true },
    // Research Interests
    majorResearchAreas: [{ type: String, trim: true }],
    minorResearchAreas: [{ type: String, trim: true }],
    keywords: [{ type: String, trim: true }],
    currentResearchFocus: { type: String, trim: true },
    interdisciplinaryInterests: { type: String, trim: true },
}, { timestamps: true });
module.exports = mongoose_1.default.model("ResearchProfile", ResearchProfileSchema);
