const mongoose = require("mongoose");

const MembershipSchema = new mongoose.Schema(
  {
    scholar: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    professionalBody: { type: String, required: true, trim: true },
    membershipNumber: { type: String, required: true, trim: true },
    membershipType: { type: String, trim: true }, // e.g. Life, Annual, Student
    startDate: { type: Date, required: true },
    expiryDate: { type: Date },
    document: {
      url: String,
      publicId: String,
      originalName: String,
      mimeType: String,
      size: Number,
    },
    verificationStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    guideNote: String,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    verifiedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Membership", MembershipSchema);
