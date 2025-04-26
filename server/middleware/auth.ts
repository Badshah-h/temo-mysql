import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/auth.js";
import { UserModel } from "../db/models/User.js";
import { PermissionModel } from "../db/models/Permission.js";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Middleware to authenticate JWT token
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];
    const user = await verifyToken(token);

    if (!user) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ message: "Authentication failed" });
  }
};

// Middleware to check user role
export const checkRole = (roles: string | string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const allowedRoles = Array.isArray(roles) ? roles : [roles];

      // Special case for admin role - always grant access
      if (req.user.role === "admin") {
        return next();
      }

      // Get user with roles from database
      const userRoles = await UserModel.getUserRolesWithPermissions(
        req.user.id,
      );

      // Check if user has any of the required roles
      const userRoleNames = userRoles.map((role) => role.name);
      const hasRequiredRole = allowedRoles.some((role) =>
        userRoleNames.includes(role),
      );

      if (!hasRequiredRole) {
        return res
          .status(403)
          .json({ message: "Access denied: insufficient permissions" });
      }

      next();
    } catch (error) {
      console.error("Role check error:", error);
      return res
        .status(500)
        .json({ message: "Error checking role permissions" });
    }
  };
};

// Middleware to check user permission
export const checkPermission = (requiredPermissions: string | string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const userId = req.user.id;
    const permissions = Array.isArray(requiredPermissions)
      ? requiredPermissions
      : [requiredPermissions];

    try {
      // Special case for admin role - always grant access
      if (req.user.role === "admin") {
        return next();
      }

      // Check each required permission
      for (const permission of permissions) {
        const hasPermission = await PermissionModel.userHasPermission(
          userId,
          permission,
        );
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

// Middleware to check if user has any of the specified permissions
export const checkAnyPermission = (permissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const userId = req.user.id;

    try {
      // Special case for admin role - always grant access
      if (req.user.role === "admin") {
        return next();
      }

      // Check if user has any of the permissions
      for (const permission of permissions) {
        const hasPermission = await PermissionModel.userHasPermission(
          userId,
          permission,
        );
        if (hasPermission) {
          return next();
        }
      }

      return res.status(403).json({
        message:
          "Access denied: you don't have any of the required permissions",
        requiredPermissions: permissions,
      });
    } catch (error) {
      console.error("Permission check error:", error);
      return res.status(500).json({ message: "Error checking permissions" });
    }
  };
};
