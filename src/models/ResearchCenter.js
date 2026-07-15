"use strict";

const mongoose = require("mongoose");

const ResearchCenterSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, unique: true },
    code: { type: String, required: true, trim: true, uppercase: true, unique: true },
    department: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    officeLocation: { type: String, trim: true },
    contactEmail: { 
        type: String, 
        trim: true, 
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    contactPhone: { type: String, trim: true },
    coordinator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

module.exports = mongoose.model("ResearchCenter", ResearchCenterSchema);
