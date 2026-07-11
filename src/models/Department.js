"use strict";

const mongoose = require("mongoose");
const DepartmentSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, unique: true },
    coordinator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    email: { type: String, trim: true, lowercase: true },
    totalScholars: { type: Number, default: 0 },
}, { timestamps: true });
module.exports = mongoose.model("Department", DepartmentSchema);
