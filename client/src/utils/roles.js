// src/utils/roles.js
export const ROLE_HIERARCHY = {
  student: 1,
  teacher: 2,
  admin: 3,
};

export const hasAccess = (userRole, requiredRole) => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};
