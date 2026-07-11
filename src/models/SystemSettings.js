"use strict";

const mongoose = require("mongoose");
const SystemSettingsSchema = new mongoose.Schema({
    systemName: { type: String, default: "Research System" },
    organization: { type: String, default: "Example University" },
    timezone: { type: String, default: "GMT+05:30" },
    dateFormat: { type: String, default: "dd/mm/yyyy" },
}, { timestamps: true });
module.exports = mongoose.model("SystemSettings", SystemSettingsSchema);
