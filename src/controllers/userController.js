"use strict";

const bcrypt = require("bcrypt");
const User = require("../models/User");
const { asyncHandler } = require("../utils/asyncHandler");
const { buildRoleQuery } = require("../utils/roles");
// Get all users, optionally filtered by role
const getAll = asyncHandler(async (req, res) => {
    const { role } = req.query;
    const query = role ? buildRoleQuery(role) : {};
    const users = await User.find(query)
        .populate("researchCenter", "name code")
        .populate("guide", "name email");
    res.json({ items: users });
});
// Get a single user by ID
const getOne = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id)
        .populate("researchCenter", "name code")
        .populate("guide", "name email");
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    res.json({ item: user });
});
// Create a new user
const create = asyncHandler(async (req, res) => {
    const { name, email, password, role, roles, department, researchCenterId, guideId, status, phone } = req.body;
    // Validate inputs
    if (!name || !email) {
        return res.status(400).json({ message: "Name and email are required" });
    }
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: "Email is already registered" });
    }
    // Hash password (generate temporary password if not provided)
    const tempPassword = password || "Welcome123";
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    let finalResearchCenter = researchCenterId;
    let finalDepartment = department;

    const isScholar = role === "scholar" || (roles && roles.includes("scholar"));
    if (isScholar && guideId) {
        const guideUser = await User.findById(guideId);
        if (guideUser) {
            finalResearchCenter = guideUser.researchCenter;
            finalDepartment = guideUser.department;
        }
    }

    // Map incoming researchCenterId and guideId to references
    const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role,
        roles,
        department: finalDepartment,
        researchCenter: finalResearchCenter || undefined,
        guide: guideId || undefined,
        status: status || "Active",
        phone,
        requirePasswordChange: password ? false : true,
    });
    await newUser.save();
    // Populate references for the response
    const populatedUser = await User.findById(newUser._id)
        .populate("researchCenter", "name code")
        .populate("guide", "name email");
    res.status(201).json({ item: populatedUser, temporaryPassword: tempPassword });
});
// Update a user
const update = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const targetUser = await User.findById(id);
    if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
    }

    // Authorization: User must be admin OR updating their own user details OR their guide
    const isSelf = req.user && req.user.userId === id;
    const isAdmin = req.user && req.user.role === "admin";
    const isGuide = req.user && targetUser.guide && targetUser.guide.toString() === req.user.userId;
    
    if (!isAdmin && !isSelf && !isGuide) {
        return res.status(403).json({ message: "You are not authorized to update this user" });
    }

    const updates = { ...req.body };

    // Regular users shouldn't be allowed to change roles, status or password requirement flags
    if (!isAdmin && !isGuide) {
        delete updates.role;
        delete updates.roles;
        delete updates.status;
        delete updates.requirePasswordChange;
    }

    // Guides can only update status, not roles/password requirements
    if (isGuide) {
        delete updates.role;
        delete updates.roles;
        delete updates.requirePasswordChange;
    }

    // If password is being updated, hash it
    if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
        if (isAdmin && !isSelf) {
            updates.passwordChangedByAdmin = true;
        }
    }
    // Map frontend fields (e.g. guideId) to Mongoose model fields (guide)
    if (updates.guideId !== undefined) {
        updates.guide = updates.guideId || null;
        delete updates.guideId;

        // If updating a scholar's guide, auto-update their research center to match the new guide's
        const isScholar = targetUser.role === "scholar" || targetUser.roles?.includes("scholar") || updates.role === "scholar" || updates.roles?.includes("scholar");
        if (updates.guide && isScholar) {
            const guideUser = await User.findById(updates.guide);
            if (guideUser) {
                updates.researchCenter = guideUser.researchCenter;
                updates.department = guideUser.department;
            }
        }
    }
    if (updates.researchCenterId !== undefined) {
        updates.researchCenter = updates.researchCenterId || null;
        delete updates.researchCenterId;
    }
    const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
        .populate("researchCenter", "name code")
        .populate("guide", "name email");
    res.json({ item: user });
});
// Delete a user
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "Success" });
});
module.exports = {
    getAll,
    getOne,
    create,
    update,
    delete: deleteUser,
};
