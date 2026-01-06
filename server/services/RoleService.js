import { ROLE_HIERARCHY } from "../config/roleHierarchy.js";

export default class RoleService {

  hasRequiredRole(userRole, allowedRoles) {
    if (!userRole) return false;

    const userLevel = ROLE_HIERARCHY[userRole] || 0;
    const allowedLevels = allowedRoles.map(r => ROLE_HIERARCHY[r] || 0);

    return allowedLevels.some(level => userLevel >= level);
  }

  isRoleAllowed(userRole, allowedRoles) {
    return allowedRoles.includes(userRole);
  }

}
