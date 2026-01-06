import AuthService from "../services/AuthService.js";
import RoleService from "../services/RoleService.js";

const authService = new AuthService();
const roleService = new RoleService();

export const protect = (req, res, next) => {
  const user = authService.getUserFromRequest(req);

  if (!user)
    return res.status(401).json({ message: "Токен недійсний або відсутній" });

  req.user = user;
  next();
};

export const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!roleService.isRoleAllowed(req.user.role, allowedRoles))
      return res.status(403).json({ message: "Доступ заборонено: недостатньо прав" });

    next();
  };
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user.role;

    if (!roleService.hasRequiredRole(userRole, allowedRoles))
      return res.status(403).json({ message: "Недостатньо прав" });

    next();
  };
};

export const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Доступ заборонено" });

  next();
};
