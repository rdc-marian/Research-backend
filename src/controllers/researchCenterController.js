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
            { roles: "research_guide" },
            { permissions: "research_guide" }
        ],
        status: "Active"
    }).select("name email uniqueId designation _id");
    res.json({ items: guides });
});

// Get faculty for a specific research center
const getFaculty = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const faculty = await User.find({
        researchCenter: id,
        role: "faculty",
        status: "Active"
    }).select("name email uniqueId designation _id");
    res.json({ items: faculty });
});

// Get scholars for a specific research center
const getScholars = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const scholars = await User.find({
        researchCenter: id,
        role: "scholar",
        status: "Active"
    })
    .populate("guide", "name email")
    .populate("researchCenter", "name code")
    .select("name email uniqueId guide status researchCenter _id");
    res.json({ items: scholars });
});

// Get all research centers
const getAll = asyncHandler(async (req, res) => {
    const centers = await ResearchCenter.find()
        .populate("coordinator", "name email");
    res.json({ items: centers });
});

// Get one research center
const getOne = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const center = await ResearchCenter.findById(id)
        .populate("coordinator", "name email");
    if (!center) {
        return res.status(404).json({ message: "Research center not found" });
    }
    res.json({ item: center });
});

// Create a research center
const create = asyncHandler(async (req, res) => {
    const { 
        name, 
        code, 
        description, 
        officeLocation, 
        contactEmail, 
        contactPhone, 
        coordinatorId, 
        status 
    } = req.body;
    
    if (!name || !code) {
        return res.status(400).json({ message: "Name and code are required" });
    }

    // Check uniqueness
    const existingName = await ResearchCenter.findOne({ name });
    if (existingName) {
        return res.status(400).json({ message: "Research center name must be unique" });
    }
    const existingCode = await ResearchCenter.findOne({ code: code.toUpperCase() });
    if (existingCode) {
        return res.status(400).json({ message: "Research center code must be unique" });
    }

    const newCenter = new ResearchCenter({
        name,
        code: code.toUpperCase(),
        description,
        officeLocation,
        contactEmail,
        contactPhone,
        coordinator: coordinatorId || undefined,
        status: status || "Active",
        createdBy: req.user ? req.user.userId : undefined
    });
    
    await newCenter.save();
    
    const populated = await ResearchCenter.findById(newCenter._id)
        .populate("coordinator", "name email");
        
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

    // Check uniqueness if name or code is updated
    if (updates.name) {
        const existingName = await ResearchCenter.findOne({ name: updates.name, _id: { $ne: id } });
        if (existingName) {
            return res.status(400).json({ message: "Research center name must be unique" });
        }
    }
    if (updates.code) {
        const existingCode = await ResearchCenter.findOne({ code: updates.code.toUpperCase(), _id: { $ne: id } });
        if (existingCode) {
            return res.status(400).json({ message: "Research center code must be unique" });
        }
        updates.code = updates.code.toUpperCase();
    }

    const center = await ResearchCenter.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
        .populate("coordinator", "name email");
        
    if (!center) {
        return res.status(404).json({ message: "Research center not found" });
    }
    res.json({ item: center });
});

// Update status only
const updateStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!status || !["Active", "Inactive"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
    }
    const center = await ResearchCenter.findByIdAndUpdate(id, { status }, { new: true })
        .populate("coordinator", "name email");
    if (!center) {
        return res.status(404).json({ message: "Research center not found" });
    }
    res.json({ item: center });
});

// Delete a research center
const deleteCenter = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // Do NOT allow deletion if Faculty or Scholars are assigned.
    const assignedUsers = await User.findOne({ researchCenter: id });
    if (assignedUsers) {
        return res.status(400).json({ message: "Cannot delete research center while faculty or scholars are assigned to it" });
    }

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
    getFaculty,
    getScholars,
    create,
    update,
    updateStatus,
    delete: deleteCenter,
};
