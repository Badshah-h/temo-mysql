import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: any;
      userId?: number;
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and adds user to request
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.sub) {
      res.status(401).json({ message: "Invalid or expired token" });
      return;
    }

    const userId = parseInt(decoded.sub, 10);
    req.userId = userId;

    // Add basic user info from token to request
    req.user = {
      id: userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Authentication failed" });
  }
};

/**
 * Role-based authorization middleware
 * Checks if user has any of the specified roles
 */
export const authorize = (roles: string | string[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: "Authentication required" });
        return;
      }

      const allowedRoles = Array.isArray(roles) ? roles : [roles];

      // Check if user has any of the required roles
      if (req.user.role && allowedRoles.includes(req.user.role)) {
        next();
        return;
      }

      // Check user roles array if available
      if (req.user.roles && Array.isArray(req.user.roles)) {
        const userRoles = req.user.roles.map((r: any) => r.name || r);
        if (allowedRoles.some((role) => userRoles.includes(role))) {
          next();
          return;
        }
      }

      res.status(403).json({
        message: "Access denied: insufficient permissions",
        requiredRoles: allowedRoles,
      });
    } catch (error) {
      console.error("Role check error:", error);
      res.status(500).json({ message: "Error checking role permissions" });
    }
  };
};
