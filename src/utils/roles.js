"use strict";

// Allowed role options in the system
const ROLE_OPTIONS = ["admin", "coordinator", "faculty", "scholar", "research_guide", "library"];
// Helper to remove duplicate values from an array
const dedupe = (values) => {
    const seen = new Set();
    const result = [];
    values.forEach((value) => {
        if (!seen.has(value)) {
            seen.add(value);
            result.push(value);
        }
    });
    return result;
};
// Normalize and validate user roles, ensuring the primary role is consistent with roles list
const normalizeRoles = ({ role, roles } = {}) => {
    const baseRoles = Array.isArray(roles) ? roles.filter(Boolean) : [];
    const withRole = role && !baseRoles.includes(role) ? [role, ...baseRoles] : baseRoles;
    const normalizedRoles = dedupe(withRole).filter((value) => ROLE_OPTIONS.includes(value));
    const primaryRole = role || normalizedRoles[0];
    if (primaryRole && !normalizedRoles.includes(primaryRole)) {
        normalizedRoles.unshift(primaryRole);
    }
    return { primaryRole, roles: normalizedRoles };
};
// Check if a user has a specific role or permission
const hasRole = (user, role) => 
    user?.roles?.includes(role) || 
    user?.role === role || 
    user?.permissions?.includes(role);

// Query helper for checking if a user has a role or permission in DB query
const buildRoleQuery = (role) => ({
    $or: [
        { role },
        { roles: role },
        { permissions: role }
    ]
});

module.exports = {
    ROLE_OPTIONS,
    buildRoleQuery,
    hasRole,
    normalizeRoles,
};
