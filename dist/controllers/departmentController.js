"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Department = require("../models/Department");
const { asyncHandler } = require("../utils/asyncHandler");
// Get all departments
const getAll = asyncHandler(async (req, res) => {
    const departments = await Department.find().populate("coordinator", "name email");
    res.json({ items: departments });
});
// Get a single department
const getOne = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const department = await Department.findById(id).populate("coordinator", "name email");
    if (!department) {
        return res.status(404).json({ message: "Department not found" });
    }
    res.json({ item: department });
});
// Create a department
const create = asyncHandler(async (req, res) => {
    const { name, coordinatorId, email, totalScholars } = req.body;
    if (!name) {
        return res.status(400).json({ message: "Department name is required" });
    }
    const newDept = new Department({
        name,
        coordinator: coordinatorId || undefined,
        email,
        totalScholars: totalScholars || 0,
    });
    await newDept.save();
    const populated = await Department.findById(newDept._id).populate("coordinator", "name email");
    res.status(201).json({ item: populated });
});
// Update a department
const update = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.coordinatorId !== undefined) {
        updates.coordinator = updates.coordinatorId || null;
        delete updates.coordinatorId;
    }
    const department = await Department.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
        .populate("coordinator", "name email");
    if (!department) {
        return res.status(404).json({ message: "Department not found" });
    }
    res.json({ item: department });
});
module.exports = {
    getAll,
    getOne,
    create,
    update,
};
