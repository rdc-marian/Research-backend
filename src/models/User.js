const mongoose = require("mongoose");
const { normalizeRoles } = require("../utils/roles");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    role: {
      type: String,
      required: true,
      enum: ["admin", "coordinator", "faculty", "scholar", "research_guide"],
    },
    roles: {
      type: [String],
      enum: ["admin", "coordinator", "faculty", "scholar", "research_guide"],
    },
    department: { type: String, trim: true },
    researchCenter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ResearchCenter",
      required: function requiredResearchCenter() {
        return (
          this.roles?.includes("scholar") ||
          this.roles?.includes("research_guide") ||
          this.role === "scholar" ||
          this.role === "research_guide"
        );
      },
    },
    guide: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function requiredGuide() {
        return this.roles?.includes("scholar") || this.role === "scholar";
      },
    },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    phone: { type: String, trim: true },
  },
  { timestamps: true }
);

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
