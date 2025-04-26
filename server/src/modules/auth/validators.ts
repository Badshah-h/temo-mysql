import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { AppError } from "../../middleware/errorHandler";

/**
 * Validate registration input
 */
export const validateRegister = [
  body("email").isEmail().withMessage("Please provide a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("fullName").notEmpty().withMessage("Full name is required"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError("Validation error", 400, errors.array());
    }
    next();
  },
];

/**
 * Validate login input
 */
export const validateLogin = [
  body("email").isEmail().withMessage("Please provide a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError("Validation error", 400, errors.array());
    }
    next();
  },
];

/**
 * Validate profile update input
 */
export const validateUpdateProfile = [
  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email address"),
  body("fullName")
    .optional()
    .notEmpty()
    .withMessage("Full name cannot be empty"),
  body("newPassword")
    .optional()
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError("Validation error", 400, errors.array());
    }
    next();
  },
];
