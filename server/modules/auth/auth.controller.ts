import express from "express";
import { authService } from "./auth.service";
import { handleError } from "../../utils/errorHandler";
import { TenantModel } from "../../db/models/Tenant";

const router = express.Router();

// Register endpoint
router.post("/register", async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    // Use a default tenant slug if not provided
    const tenantSlug = req.body.tenantSlug || "default";

    console.log("Registration attempt:", { email, fullName, tenantSlug });

    const result = await authService.register({
      tenantSlug,
      email,
      password,
      fullName,
    });
    res.status(201).json(result);
  } catch (error) {
    console.error("Registration error:", error);
    handleError(res, error);
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Use a default tenant slug if not provided
    const tenantSlug = req.body.tenantSlug || "default";

    const result = await authService.login({ tenantSlug, email, password });
    res.json(result);
  } catch (error) {
    console.error("Login error:", error);
    handleError(res, error);
  }
});

// Get current user endpoint
router.get("/me", authService.authenticate, async (req, res) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);

    // Get tenant information if user has tenantId
    let tenant = null;
    if (user.tenantId) {
      tenant = await TenantModel.findById(user.tenantId);
    }

    res.json({ user, tenant });
  } catch (error) {
    handleError(res, error);
  }
});

// Tenant endpoints
router.get("/tenants", async (_req, res) => {
  try {
    const tenants = await TenantModel.getAll();
    res.json({ tenants });
  } catch (error) {
    handleError(res, error);
  }
});

router.post("/tenants", authService.authenticate, async (req, res) => {
  try {
    const { name, slug, logoUrl, primaryColor, secondaryColor } = req.body;

    // Check if tenant with slug already exists
    const existingTenant = await TenantModel.findBySlug(slug);
    if (existingTenant) {
      return res
        .status(409)
        .json({ message: "Tenant with this slug already exists" });
    }

    // Create tenant
    const tenant = await TenantModel.create({
      name,
      slug,
      logoUrl,
      primaryColor,
      secondaryColor,
      createdBy: req.user.id,
    });

    res.status(201).json({ tenant });
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/tenants/:id", async (req, res) => {
  try {
    const tenant = await TenantModel.findById(parseInt(req.params.id));
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }
    res.json({ tenant });
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/tenants/by-slug/:slug", async (req, res) => {
  try {
    const tenant = await TenantModel.findBySlug(req.params.slug);
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }
    res.json({ tenant });
  } catch (error) {
    handleError(res, error);
  }
});

export default router;
