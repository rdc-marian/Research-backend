const ROLE_OPTIONS = ["admin", "coordinator", "faculty", "scholar", "research_guide"];

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

const hasRole = (user, role) =>
  user?.roles?.includes(role) || user?.role === role;

const buildRoleQuery = (role) => ({ $or: [{ role }, { roles: role }] });

module.exports = {
  ROLE_OPTIONS,
  buildRoleQuery,
  hasRole,
  normalizeRoles,
};
