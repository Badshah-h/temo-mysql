import { Express } from "express";
import authRoutes from "../modules/auth/routes";
import userRoutes from "../modules/user/routes";
import roleRoutes from "../modules/role/routes";
import permissionRoutes from "../modules/permission/routes";

/**
 * Setup all API routes
 */
export function setupRoutes(app: Express): void {
  // API version prefix
  const apiPrefix = "/api";

  // Register all module routes
  app.use(`${apiPrefix}/auth`, authRoutes);
  app.use(`${apiPrefix}/users`, userRoutes);
  app.use(`${apiPrefix}/roles`, roleRoutes);
  app.use(`${apiPrefix}/permissions`, permissionRoutes);

  // Additional routes can be added here as the application grows
}
