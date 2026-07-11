"use strict";

const mongoose = require("mongoose");
const ResearchProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
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
module.exports = mongoose.model("ResearchProfile", ResearchProfileSchema);
