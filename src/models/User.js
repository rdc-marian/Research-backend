"use strict";

const mongoose = require("mongoose");
const { normalizeRoles } = require("../utils/roles");
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    role: {
        type: String,
        required: true,
        enum: ["admin", "coordinator", "faculty", "scholar", "research_guide", "library"],
    },
    roles: {
        type: [String],
        enum: ["admin", "coordinator", "faculty", "scholar", "research_guide", "library"],
    },
    password: {
        type: String,
        required: true,
    },
    department: { type: String, trim: true },
    researchCenter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ResearchCenter",
    },
    guide: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    status: { type: String, enum: ["Active", "Inactive", "PendingApproval"], default: "Active" },
    phone: { type: String, trim: true },
    requirePasswordChange: { type: Boolean, default: false },
    passwordChangedByAdmin: { type: Boolean, default: false },
    designation: { type: String, trim: true },
    uniqueId: { type: String, trim: true },
    avatar: { type: String },
    academicYear: { type: String, trim: true },
    preferences: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });
UserSchema.pre("validate", function normalizeRoleFields(next) {
    const { primaryRole, roles } = normalizeRoles({ role: this.role, roles: this.roles });
    if (roles.length > 0) {
        this.roles = roles;
    }
    if (primaryRole) {
        this.role = primaryRole;
    }
    next();
});
module.exports = mongoose.model("User", UserSchema);
