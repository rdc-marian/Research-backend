"use strict";

const jwt = require("jsonwebtoken");

// Middleware to authenticate users using JWT token in Cookie or Authorization header
const authenticate = (req, res, next) => {
    try {
        let token = req.cookies?.token;
        if (!token) {
            const authHeader = req.headers.authorization;
            token = authHeader && authHeader.split(" ")[1];
        }
        if (!token) {
            return res.status(401).json({ message: "Authentication required" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
        
        // Enforce password change restriction if required
        // Use req.path instead of originalUrl to prevent query parameter bypasses
        const path = req.path;
        if (decoded.requirePasswordChange &&
            !path.includes("/auth/change-password") &&
            !path.includes("/auth/me") &&
            !path.includes("/auth/logout")) {
            return res.status(403).json({
                message: "First login password change required",
                requirePasswordChange: true
            });
        }
        
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

// Middleware to authorize user based on role list
const authorizeRoles = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(403).json({ message: "Access denied: user details missing" });
        }
        
        const rolesToCheck = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
        const userRoles = req.user.roles || [req.user.role];
        const hasAllowedRole = userRoles.some((role) => rolesToCheck.includes(role));
        
        if (!hasAllowedRole) {
            return res.status(403).json({ message: "Access denied: insufficient permissions" });
        }
        next();
    };
};

// Middleware to authorize user based on permissions
const authorizePermissions = (allowedPermissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(403).json({ message: "Access denied: user details missing" });
        }
        
        // Admin overrides permission checks
        const userRoles = req.user.roles || [req.user.role];
        if (userRoles.includes("admin")) {
            return next();
        }
        
        const permsToCheck = Array.isArray(allowedPermissions) ? allowedPermissions : [allowedPermissions];
        const userPerms = req.user.permissions || [];
        const hasPermission = permsToCheck.some(p => userPerms.includes(p));
        
        if (!hasPermission) {
            return res.status(403).json({ message: "Access denied: missing required permissions" });
        }
        next();
    };
};

module.exports = { authenticate, authorizeRoles, authorizePermissions };
