import express from "express";
import { authenticate } from "../../middleware/auth";

const router = express.Router();

// Endpoint to verify token validity
router.get("/verify", authenticate, (req, res) => {
  // If middleware authenticate passes, token is valid
  res.status(200).json({ valid: true, user: req.user });
});

export default router;
