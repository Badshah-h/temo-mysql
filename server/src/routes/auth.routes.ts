import express from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";

const router = express.Router();

// Public routes
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/check-email/:email", AuthController.checkEmail);

// Protected routes
router.get("/me", authenticate, AuthController.getCurrentUser);
router.post("/logout", authenticate, AuthController.logout);
router.put("/profile", authenticate, AuthController.updateProfile);

export default router;
