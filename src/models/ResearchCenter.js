"use strict";

const mongoose = require("mongoose");
const ResearchCenterSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, unique: true },
    code: { type: String, required: true, trim: true, uppercase: true, unique: true },
    coordinator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
}, { timestamps: true });
module.exports = mongoose.model("ResearchCenter", ResearchCenterSchema);
