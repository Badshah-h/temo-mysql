import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../lib/db";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key",
    ) as any;

    // Add user to request
    req.user = decoded;

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

export const authorize = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const userId = req.user.id;
      const allowedRoles = Array.isArray(roles) ? roles : [roles];

      // Check if user has admin role (always grant access)
      const adminCheck = await db("user_roles")
        .join("roles", "user_roles.role_id", "roles.id")
        .where({
          "user_roles.user_id": userId,
          "roles.name": "admin",
        })
        .first();

      if (adminCheck) {
        return next();
      }

      // Check if user has any of the required roles
      const userRoles = await db("user_roles")
        .select("roles.name")
        .join("roles", "user_roles.role_id", "roles.id")
        .where("user_roles.user_id", userId);

      const userRoleNames = userRoles.map((role) => role.name);
      const hasRequiredRole = allowedRoles.some((role) =>
        userRoleNames.includes(role),
      );

      if (!hasRequiredRole) {
        return res.status(403).json({ message: "Not authorized" });
      }

      next();
    } catch (error) {
      console.error("Authorization error:", error);
      return res.status(500).json({ message: "Authorization failed" });
    }
  };
};

export const checkPermission = (permissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const userId = req.user.id;
      const requiredPermissions = Array.isArray(permissions)
        ? permissions
        : [permissions];

      // Check if user has admin role (always grant access)
      const adminCheck = await db("user_roles")
        .join("roles", "user_roles.role_id", "roles.id")
        .where({
          "user_roles.user_id": userId,
          "roles.name": "admin",
        })
        .first();

      if (adminCheck) {
        return next();
      }

      // Check if user has all required permissions
      for (const permission of requiredPermissions) {
        const hasPermission = await db("permissions")
          .join(
            "role_permissions",
            "permissions.id",
            "role_permissions.permission_id",
          )
          .join("user_roles", "role_permissions.role_id", "user_roles.role_id")
          .where({
            "user_roles.user_id": userId,
            "permissions.name": permission,
          })
          .first();

        if (!hasPermission) {
          return res.status(403).json({
            message: "Not authorized",
            missingPermission: permission,
          });
        }
      }

      next();
    } catch (error) {
      console.error("Permission check error:", error);
      return res.status(500).json({ message: "Permission check failed" });
    }
  };
};
