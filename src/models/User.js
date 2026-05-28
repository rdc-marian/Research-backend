const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    role: {
      type: String,
      required: true,
      enum: ["admin", "coordinator", "faculty", "scholar"],
    },
    department: { type: String, trim: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    phone: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
