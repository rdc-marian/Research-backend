const mongoose = require("mongoose");

const QualificationSchema = new mongoose.Schema(
  {
    scholar: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    degree: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    institution: { type: String, required: true, trim: true },
    university: { type: String, required: true, trim: true },
    yearOfPassing: { type: Number, required: true },
    percentage: { type: Number },
    status: { type: String, enum: ["Completed", "Pursuing"], default: "Completed" },
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

module.exports = mongoose.model("Qualification", QualificationSchema);
