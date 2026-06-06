const mongoose = require("mongoose");

const PatentSchema = new mongoose.Schema(
  {
    scholar: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    applicationNumber: { type: String, required: true, trim: true },
    patentStatus: {
      type: String,
      enum: ["Filed", "Published", "Granted"],
      default: "Filed",
    },
    filingDate: { type: Date, required: true },
    publicationDate: { type: Date },
    grantDate: { type: Date },
    inventors: { type: String, required: true, trim: true },
    patentUrl: { type: String, trim: true },
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

module.exports = mongoose.model("Patent", PatentSchema);
