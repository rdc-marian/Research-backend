"use strict";

const mongoose = require("mongoose");
const { normalizeRoles } = require("../utils/roles");

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    role: {
        type: String,
        required: true,
        enum: ["admin", "faculty", "scholar", "library"],
    },
    roles: {
        type: [String],
        enum: ["admin", "faculty", "scholar", "library"],
    },
    password: {
        type: String,
        required: true,
    },
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
    permissions: { type: [String], default: [] },
    admissionDate: { type: Date },
    employeeId: { type: String, trim: true },
}, { timestamps: true });

UserSchema.pre("validate", function normalizeRoleFields(next) {
    // Move permissions out of roles/role if they are guide or coordinator
    let incomingRoles = Array.isArray(this.roles) ? [...this.roles] : [];
    if (this.role && !incomingRoles.includes(this.role)) {
        incomingRoles.push(this.role);
    }

    const permissions = this.permissions || [];
    
    // Check if roles contain permissions
    if (incomingRoles.includes("research_guide")) {
        if (!permissions.includes("research_guide")) {
            permissions.push("research_guide");
        }
        incomingRoles = incomingRoles.filter(r => r !== "research_guide");
    }
    if (incomingRoles.includes("coordinator")) {
        if (!permissions.includes("coordinator")) {
            permissions.push("coordinator");
        }
        incomingRoles = incomingRoles.filter(r => r !== "coordinator");
    }
    
    // If we filtered out guide/coordinator and are left with nothing, default to faculty
    if (incomingRoles.length === 0) {
        incomingRoles.push("faculty");
    }
    
    // Set permissions
    this.permissions = Array.from(new Set(permissions));
    
    // Normalize primary and roles list using the 4 main roles
    const ROLE_OPTIONS_4 = ["admin", "faculty", "scholar", "library"];
    const baseRoles = incomingRoles.filter((r) => ROLE_OPTIONS_4.includes(r));
    if (baseRoles.length === 0) {
        baseRoles.push("faculty");
    }
    
    this.roles = Array.from(new Set(baseRoles));
    this.role = this.roles[0];
    
    next();
});

UserSchema.set('toJSON', {});
UserSchema.set('toObject', {});

module.exports = mongoose.model("User", UserSchema);
