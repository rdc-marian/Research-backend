"use strict";

const bcrypt = require("bcrypt");
const User = require("../models/User");
const ResearchCenter = require("../models/ResearchCenter");
const { asyncHandler } = require("../utils/asyncHandler");
const { buildRoleQuery } = require("../utils/roles");

const isValidResearchGuide = (user) => user?.role === "faculty" && user?.permissions?.includes("research_guide");

// Get all users, optionally filtered by role
const getAll = asyncHandler(async (req, res) => {
    const requester = req.user;
    if (!requester) {
        return res.status(401).json({ message: "Authentication required" });
    }

    const requesterRoles = requester.roles || [requester.role];
    const isAdmin = requesterRoles.includes("admin");
    const isFaculty = requesterRoles.includes("faculty");
    const hasGuidePerm = requester.permissions?.includes("research_guide");

    let query = {};
    const { role } = req.query;
    if (role) {
        query = buildRoleQuery(role);
    }

    if (isAdmin) {
        // Admin has full unrestricted access
    } else if (isFaculty && hasGuidePerm) {
        // Faculty guides can only fetch their own scholars
        query.guide = requester.userId;
    } else {
        return res.status(403).json({ message: "Access denied: insufficient permissions" });
    }

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

    const requester = req.user;
    if (!requester) {
        return res.status(401).json({ message: "Authentication required" });
    }

    const requesterRoles = requester.roles || [requester.role];
    const isAdmin = requesterRoles.includes("admin");
    const isSelf = requester.userId === id;

    if (isAdmin || isSelf) {
        // Full access
    } else if (requesterRoles.includes("faculty") && requester.permissions?.includes("research_guide")) {
        // Faculty guides can only fetch their own scholars
        const scholarGuideId = user.guide?._id ? user.guide._id.toString() : (user.guide ? user.guide.toString() : null);
        if (scholarGuideId !== requester.userId) {
            return res.status(403).json({ message: "Access denied: you are not the guide for this scholar" });
        }
    } else {
        return res.status(403).json({ message: "Access denied: insufficient permissions" });
    }

    res.json({ item: user });
});

// Get all active research guides (Faculty with research_guide permission)
const getResearchGuides = asyncHandler(async (req, res) => {
    const guides = await User.find({
        $or: [
            { role: "research_guide" },
            { roles: "research_guide" },
            { permissions: "research_guide" }
        ],
        status: "Active"
    })
    .populate("researchCenter", "name code")
    .populate("guide", "name email");
    
    res.json({ items: guides });
});

// Create a new user
const create = asyncHandler(async (req, res) => {
    const { name, email, password, role, roles, permissions, researchCenterId, guideId, status, phone } = req.body;
    
    // Validate inputs
    if (!name || !email) {
        return res.status(400).json({ message: "Name and email are required" });
    }
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: "Email is already registered" });
    }

    const incomingRoles = Array.isArray(roles) ? roles : (role ? [role] : []);
    const isScholar = incomingRoles.includes("scholar") || role === "scholar";
    const isFaculty = incomingRoles.includes("faculty") || incomingRoles.includes("research_guide") || incomingRoles.includes("coordinator") || role === "faculty" || role === "research_guide" || role === "coordinator";

    let finalResearchCenter = researchCenterId;
    let finalGuide = guideId;

    if (isScholar) {
        if (!guideId) {
            return res.status(400).json({ message: "Research guide is required for scholars" });
        }
        const guideUser = await User.findById(guideId);
        if (!guideUser) {
            return res.status(400).json({ message: "Selected Research Guide does not exist" });
        }
        if (!isValidResearchGuide(guideUser)) {
            return res.status(400).json({ message: "Selected guide is not a valid Research Guide" });
        }
        // Automatically inherit research center from guide
        finalResearchCenter = guideUser.researchCenter;
        if (!finalResearchCenter) {
            return res.status(400).json({ message: "Selected Research Guide does not belong to any Research Centre" });
        }
    }

    if (isFaculty) {
        // Faculty must belong to exactly one Research Center
        if (!finalResearchCenter) {
            const defaultCenter = await ResearchCenter.findOne();
            if (defaultCenter) {
                finalResearchCenter = defaultCenter._id;
            } else {
                return res.status(400).json({ message: "Research center is required for faculty, but none exist in the system" });
            }
        }
    }

    // Hash password (generate temporary password if not provided)
    const tempPassword = password || "Welcome123";
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role,
        roles,
        permissions,
        researchCenter: finalResearchCenter || undefined,
        guide: finalGuide || undefined,
        status: status || "Active",
        phone,
        requirePasswordChange: password ? false : true,
    });
    
    await newUser.save();
    
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

    // Prevent duplicate email address
    if (updates.email && updates.email.toLowerCase() !== targetUser.email.toLowerCase()) {
        const existingEmail = await User.findOne({ email: updates.email.toLowerCase() });
        if (existingEmail) {
            return res.status(400).json({ message: "Email is already registered by another user" });
        }
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
    }
    if (updates.researchCenterId !== undefined) {
        updates.researchCenter = updates.researchCenterId || null;
        delete updates.researchCenterId;
    }

    const currentRoles = updates.roles || (updates.role ? [updates.role] : targetUser.roles || [targetUser.role]);
    const isScholar = currentRoles.includes("scholar") || targetUser.role === "scholar";
    const isFaculty = currentRoles.includes("faculty") || currentRoles.includes("research_guide") || currentRoles.includes("coordinator");

    if (isScholar) {
        const finalGuide = updates.guide !== undefined ? updates.guide : targetUser.guide;
        if (!finalGuide) {
            return res.status(400).json({ message: "Scholar must have exactly one Research Guide" });
        }
        
        // If guide has changed or researchCenter is not yet set, update it
        if (updates.guide || !targetUser.researchCenter) {
            const guideUser = await User.findById(finalGuide);
            if (!guideUser) {
                return res.status(400).json({ message: "Selected Research Guide does not exist" });
            }
            if (!isValidResearchGuide(guideUser)) {
                return res.status(400).json({ message: "Selected guide is not a valid Research Guide" });
            }
            updates.researchCenter = guideUser.researchCenter;
            if (!updates.researchCenter) {
                return res.status(400).json({ message: "Selected Research Guide does not belong to any Research Centre" });
            }
        }
    }

    if (isFaculty) {
        const finalResearchCenter = updates.researchCenter !== undefined ? updates.researchCenter : targetUser.researchCenter;
        if (!finalResearchCenter) {
            return res.status(400).json({ message: "Research center is required for faculty" });
        }

        // If this faculty is a research guide, update all their scholars' researchCenter to match
        const isGuideUser = targetUser.permissions?.includes("research_guide") || targetUser.roles?.includes("research_guide") || currentRoles.includes("research_guide");
        if (isGuideUser && updates.researchCenter) {
            await User.updateMany(
                { guide: id },
                { researchCenter: updates.researchCenter }
            );
        }
    }

    // Copy updates to targetUser document so validation and normalizeRoleFields run
    Object.keys(updates).forEach((key) => {
        targetUser[key] = updates[key];
    });

    await targetUser.save();

    const user = await User.findById(id)
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
    getResearchGuides,
    create,
    update,
    delete: deleteUser,
};
