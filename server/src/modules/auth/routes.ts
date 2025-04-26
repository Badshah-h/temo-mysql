import express from "express";
import { AuthController } from "./controller";
import { authenticate } from "../../middleware/auth";
import {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
} from "./validators";

const router = express.Router();

// Public routes
router.post("/register", validateRegister, AuthController.register);
router.post("/login", validateLogin, AuthController.login);
router.get("/check-email/:email", AuthController.checkEmail);

// Protected routes
router.get("/me", authenticate, AuthController.getCurrentUser);
router.post("/logout", authenticate, AuthController.logout);
router.put(
  "/profile",
  authenticate,
  validateUpdateProfile,
  AuthController.updateProfile,
);

export default router;
