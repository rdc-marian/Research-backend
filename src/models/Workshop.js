const mongoose = require("mongoose");

const WorkshopSchema = new mongoose.Schema(
  {
    scholar: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["Attended", "Organized", "Resource Person"],
      default: "Attended",
    },
    organizer: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    durationDays: { type: Number },
    fundingAgency: { type: String, trim: true },
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

module.exports = mongoose.model("Workshop", WorkshopSchema);
