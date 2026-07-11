"use strict";

const ResearchCenter = require("../models/ResearchCenter");
const User = require("../models/User");
const { asyncHandler } = require("../utils/asyncHandler");

// Get guides for a specific research center
const getGuides = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const guides = await User.find({
        researchCenter: id,
        $or: [
            { role: "research_guide" },
            { roles: "research_guide" }
        ],
        status: "Active"
    }).select("name email department _id");
    res.json({ items: guides });
});
// Get all research centers
const getAll = asyncHandler(async (req, res) => {
    const centers = await ResearchCenter.find()
        .populate("coordinator", "name email")
        .populate("department");
    res.json({ items: centers });
});
// Get one research center
const getOne = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const center = await ResearchCenter.findById(id)
        .populate("coordinator", "name email")
        .populate("department");
    if (!center) {
        return res.status(404).json({ message: "Research center not found" });
    }
    res.json({ item: center });
});
// Create a research center
const create = asyncHandler(async (req, res) => {
    const { name, code, coordinatorId, departmentId, status } = req.body;
    if (!name || !code) {
        return res.status(400).json({ message: "Name and code are required" });
    }
    const newCenter = new ResearchCenter({
        name,
        code,
        coordinator: coordinatorId || undefined,
        department: departmentId || undefined,
        status: status || "Active",
    });
    await newCenter.save();
    const populated = await ResearchCenter.findById(newCenter._id)
        .populate("coordinator", "name email")
        .populate("department");
    res.status(201).json({ item: populated });
});
// Update a research center
const update = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.coordinatorId !== undefined) {
        updates.coordinator = updates.coordinatorId || null;
        delete updates.coordinatorId;
    }
    if (updates.departmentId !== undefined) {
        updates.department = updates.departmentId || null;
        delete updates.departmentId;
    }
    const center = await ResearchCenter.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
        .populate("coordinator", "name email")
        .populate("department");
    if (!center) {
        return res.status(404).json({ message: "Research center not found" });
    }
    res.json({ item: center });
});
// Delete a research center
const deleteCenter = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const center = await ResearchCenter.findByIdAndDelete(id);
    if (!center) {
        return res.status(404).json({ message: "Research center not found" });
    }
    res.json({ message: "Success" });
});
module.exports = {
    getAll,
    getOne,
    getGuides,
    create,
    update,
    delete: deleteCenter,
};
