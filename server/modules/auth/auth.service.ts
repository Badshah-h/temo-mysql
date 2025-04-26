import { authRepository } from "./auth.repository";
import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import type ms from "ms";
import { AppError } from "../../utils/errorHandler";
import { Request, Response, NextFunction } from "express";
import { TenantModel } from "../../db/models/Tenant";
import db from "../../lib/db";

// Ensure correct types for JWT secret and expiry
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

export const authService = {
  async register({
    tenantSlug,
    email,
    password,
    fullName,
  }: {
    tenantSlug: string;
    email: string;
    password: string;
    fullName: string;
  }) {
    try {
      console.log("Finding tenant:", tenantSlug);

      // Find tenant by slug or create a default one if it doesn't exist
      let tenant = await TenantModel.findBySlug(tenantSlug);

      if (!tenant) {
        console.log("Tenant not found, creating default tenant");
        // Create a default tenant if it doesn't exist
        const tenantId = await TenantModel.create({
          name: tenantSlug === "default" ? "Default Tenant" : tenantSlug,
          slug: tenantSlug,
          primaryColor: "#3b82f6",
          secondaryColor: "#10b981",
        });

        tenant = await TenantModel.findById(tenantId);
        if (!tenant) {
          throw new AppError("Failed to create tenant", 500);
        }
      }

      // Check if user exists in this tenant
      console.log("Checking if user exists:", email, tenant.id);
      const existingUser = await authRepository.findByEmail(email, tenant.id);
      if (existingUser) {
        throw new AppError("User already exists", 409);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      console.log("Creating user:", { email, fullName, tenantId: tenant.id });
      const user = await authRepository.createUser({
        tenantId: tenant.id,
        email,
        password: hashedPassword,
        fullName,
      });
      if (!user) throw new AppError("Failed to create user", 500);

      // Assign default role 'user'
      try {
        const { RoleModel } = await import("../../db/models/Role");
        const userRole = await RoleModel.findByName("user");
        if (userRole) {
          await RoleModel.assignRoleToUser(user.id, userRole.id);
        } else {
          console.log("User role not found, skipping role assignment");
        }
      } catch (roleError) {
        console.error("Error assigning role:", roleError);
        // Continue without role assignment if it fails
      }

      // Generate token with tenant and branding claims
      const tokenPayload = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        tenantId: tenant.id,
        brand: tenant.name,
        theme: {
          primaryColor: tenant.primaryColor || "#3b82f6",
          secondaryColor: tenant.secondaryColor || "#10b981",
          logoUrl: tenant.logoUrl || "",
        },
      };

      const token = jwt.sign(tokenPayload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN as string,
      });

      return { user, token, tenant };
    } catch (error) {
      console.error("Registration service error:", error);
      throw error;
    }
  },

  async login({
    tenantSlug,
    email,
    password,
  }: {
    tenantSlug: string;
    email: string;
    password: string;
  }) {
    try {
      // Find tenant by slug
      let tenant = await TenantModel.findBySlug(tenantSlug);
      if (!tenant) {
        // Use default tenant if specific tenant not found
        tenant = await TenantModel.findBySlug("default");
        if (!tenant) {
          throw new AppError("Tenant not found", 404);
        }
      }

      // Find user by email and tenant
      const user = await authRepository.findByEmail(email, tenant.id);
      if (!user) throw new AppError("Invalid credentials", 401);

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new AppError("Invalid credentials", 401);

      // Get user roles and permissions
      try {
        const { RoleModel } = await import("../../db/models/Role");
        const roles = await RoleModel.getUserRoles(user.id);
        if (roles && roles.length > 0) {
          user.roles = roles;
        }
      } catch (error) {
        console.error("Error fetching user roles:", error);
      }

      // Generate token with tenant and branding claims
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          tenantId: tenant.id,
          brand: tenant.name,
          theme: {
            primaryColor: tenant.primaryColor || "#3b82f6",
            secondaryColor: tenant.secondaryColor || "#10b981",
            logoUrl: tenant.logoUrl || "",
          },
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN as string },
      );

      return { user, token, tenant };
    } catch (error) {
      console.error("Login service error:", error);
      throw error;
    }
  },

  async getCurrentUser(userId: number) {
    const user = await authRepository.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    // Get user roles and permissions
    try {
      const { RoleModel } = await import("../../db/models/Role");
      const roles = await RoleModel.getUserRoles(user.id);
      if (roles && roles.length > 0) {
        user.roles = roles;
      }
    } catch (error) {
      console.error("Error fetching user roles:", error);
    }

    return user;
  },

  async getUserTenants(userId: number) {
    try {
      // Get all tenants the user belongs to
      const tenants = await TenantModel.getUserTenants(userId);
      return tenants;
    } catch (error) {
      console.error("Error fetching user tenants:", error);
      throw new AppError("Failed to fetch user tenants", 500);
    }
  },

  authenticate(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = {
        id: decoded.id,
        email: decoded.email,
        fullName: decoded.fullName,
        tenantId: decoded.tenantId,
      };

      // Add tenant info to request for tenant isolation
      req.tenant = {
        id: decoded.tenantId,
        name: decoded.brand,
        theme: decoded.theme,
      };

      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  },

  // Middleware to ensure tenant isolation
  ensureTenantAccess(req: Request, res: Response, next: NextFunction) {
    // Check if the requested tenant matches the user's tenant
    const requestedTenantId = parseInt(
      req.params.tenantId || (req.query.tenantId as string) || "0",
    );
    const requestedTenantSlug =
      req.params.tenantSlug || (req.query.tenantSlug as string);

    if (requestedTenantId && req.user.tenantId !== requestedTenantId) {
      return res.status(403).json({ message: "Access denied to this tenant" });
    }

    if (requestedTenantSlug) {
      // Need to verify the slug matches the user's tenant
      TenantModel.findBySlug(requestedTenantSlug)
        .then((tenant) => {
          if (!tenant || tenant.id !== req.user.tenantId) {
            return res
              .status(403)
              .json({ message: "Access denied to this tenant" });
          }
          next();
        })
        .catch((error) => {
          console.error("Error in tenant access check:", error);
          return res.status(500).json({ message: "Internal server error" });
        });
    } else {
      next();
    }
  },
};
