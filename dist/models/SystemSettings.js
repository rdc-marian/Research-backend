"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const SystemSettingsSchema = new mongoose_1.default.Schema({
    systemName: { type: String, default: "Research System" },
    organization: { type: String, default: "Example University" },
    timezone: { type: String, default: "GMT+05:30" },
    dateFormat: { type: String, default: "dd/mm/yyyy" },
}, { timestamps: true });
module.exports = mongoose_1.default.model("SystemSettings", SystemSettingsSchema);
