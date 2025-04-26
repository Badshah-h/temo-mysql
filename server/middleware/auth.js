import { verifyToken } from "../lib/auth.js";
import { UserModel } from "../db/models/User.js";

/**
 * Authentication middleware
 * Verifies JWT token and adds user to request
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = await verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Get user with roles and permissions
    const user = await UserModel.findByIdWithRolesAndPermissions(
      parseInt(decoded.sub),
    );

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ message: "Authentication failed" });
  }
};

/**
 * Role-based authorization middleware
 * Checks if user has any of the specified roles
 */
export const checkRole = (roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const allowedRoles = Array.isArray(roles) ? roles : [roles];

      // Check if user has any of the required roles
      for (const role of allowedRoles) {
        if (await UserModel.hasRole(req.user.id, role)) {
          return next();
        }
      }

      return res.status(403).json({
        message: "Access denied: insufficient permissions",
        requiredRoles: allowedRoles,
      });
    } catch (error) {
      console.error("Role check error:", error);
      return res
        .status(500)
        .json({ message: "Error checking role permissions" });
    }
  };
};

/**
 * Permission-based authorization middleware
 * Checks if user has all specified permissions
 */
export const checkPermission = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = req.user.id;
      const permissions = Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions];

      // Special case for admin role - always grant access
      if (await UserModel.hasRole(userId, "admin")) {
        return next();
      }

      // Check each required permission
      for (const permission of permissions) {
        const hasPermission = await UserModel.hasPermission(userId, permission);

        if (!hasPermission) {
          return res.status(403).json({
            message: "Access denied: you don't have the required permissions",
            requiredPermission: permission,
          });
        }
      }

      next();
    } catch (error) {
      console.error("Permission check error:", error);
      return res.status(500).json({ message: "Error checking permissions" });
    }
  };
};
