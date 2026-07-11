"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { normalizeRoles } = require("../utils/roles");
const UserSchema = new mongoose_1.default.Schema({
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
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "ResearchCenter",
        required: function requiredResearchCenter() {
            return (this.roles?.includes("scholar") ||
                this.roles?.includes("research_guide") ||
                this.role === "scholar" ||
                this.role === "research_guide");
        },
    },
    guide: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: function requiredGuide() {
            return this.roles?.includes("scholar") || this.role === "scholar";
        },
    },
    status: { type: String, enum: ["Active", "Inactive", "PendingApproval"], default: "Active" },
    phone: { type: String, trim: true },
    requirePasswordChange: { type: Boolean, default: false },
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
module.exports = mongoose_1.default.model("User", UserSchema);
