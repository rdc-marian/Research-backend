"use strict";

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { asyncHandler } = require("../utils/asyncHandler");
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";
// User login handler
const login = asyncHandler(async (req, res) => {
    const { email, password, role } = req.body;
    // Validate inputs
    if (!email || !password || !role) {
        return res.status(400).json({ message: "Email, password, and role are required" });
    }
    // Find user by email and populate research center & guide references
    const user = await User.findOne({ email })
        .populate("researchCenter", "name code")
        .populate("guide", "name email");
    if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
    }
    // Verify status is active
    if (user.status !== "Active") {
        return res.status(403).json({ message: "Your account is currently inactive" });
    }
    // Verify password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        if (user.passwordChangedByAdmin) {
            return res.status(401).json({ message: "Password changed by Admin. Please use your new password." });
        }
        return res.status(401).json({ message: "Invalid email or password" });
    }
    
    if (user.passwordChangedByAdmin) {
        user.passwordChangedByAdmin = false;
        await user.save();
    }
    // Verify role
    const { hasRole } = require("../utils/roles");
    if (!hasRole(user, role)) {
        return res.status(403).json({ message: "You do not have access to the selected role" });
    }
    // Generate JWT token using the selected role
    const token = jwt.sign({
        userId: user._id,
        role: role,
        roles: user.roles,
        permissions: user.permissions || [],
        requirePasswordChange: user.requirePasswordChange || false
    }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    // Set JWT as HTTP-only cookie
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
    // Return token and user details to frontend
    const userObj = user.toObject();
    const userData = {
        _id: userObj._id,
        name: userObj.name,
        email: userObj.email,
        role: role,
        roles: userObj.roles,
        department: userObj.department,
        researchCenter: userObj.researchCenter,
        guide: userObj.guide,
        requirePasswordChange: userObj.requirePasswordChange || false,
        permissions: userObj.permissions || [],
        designation: userObj.designation,
        uniqueId: userObj.uniqueId,
        avatar: userObj.avatar,
        academicYear: userObj.academicYear,
        preferences: userObj.preferences,
    };
    res.json({
        token,
        user: userData,
        item: userData,
    });
});
// User logout handler
const logout = asyncHandler(async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });
    res.json({ message: "Logged out successfully" });
});
// Retrieve current logged in user details from JWT token context
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.userId)
        .populate("researchCenter", "name code")
        .populate("guide", "name email");
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    const userObj = user.toObject();
    const userData = {
        _id: userObj._id,
        name: userObj.name,
        email: userObj.email,
        role: req.user.role || userObj.role,
        roles: userObj.roles,
        department: userObj.department,
        researchCenter: userObj.researchCenter,
        guide: userObj.guide,
        requirePasswordChange: userObj.requirePasswordChange || false,
        permissions: user.permissions || [],
        designation: user.designation,
        uniqueId: user.uniqueId,
        avatar: user.avatar,
        academicYear: user.academicYear,
        preferences: user.preferences,
    };
    res.json({
        user: userData,
        item: userData,
    });
});
// Change password handler
const changePassword = asyncHandler(async (req, res) => {
    const currentPassword = req.body.currentPassword || req.body.oldPassword;
    const { newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
    }
    const user = await User.findById(req.user.userId);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: "Invalid current password" });
    }
    // Hash and save new password
    user.password = await bcrypt.hash(newPassword, 10);
    user.requirePasswordChange = false;
    await user.save();
    // Sign a new token reflecting the password change
    const allowedRoles = user.roles && user.roles.length > 0 ? user.roles : [user.role];
    const role = req.user.role || user.role || allowedRoles[0];
    const token = jwt.sign({
        userId: user._id,
        role: role,
        roles: user.roles,
        permissions: user.permissions || [],
        requirePasswordChange: false
    }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    // Set the updated cookie
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({
        message: "Password updated successfully",
        token,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: role,
            roles: user.roles,
            permissions: user.permissions || [],
            requirePasswordChange: false,
            designation: user.designation,
            uniqueId: user.uniqueId,
            avatar: user.avatar,
            academicYear: user.academicYear,
            preferences: user.preferences,
        }
    });
});
module.exports = {
    login,
    logout,
    getMe,
    changePassword,
};
