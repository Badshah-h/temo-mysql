import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { AppError } from "../../middleware/errorHandler";

/**
 * Validate create user input
 */
export const validateCreateUser = [
  body("email").isEmail().withMessage("Please provide a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("fullName").notEmpty().withMessage("Full name is required"),
  body("role").optional().isString().withMessage("Role must be a string"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError("Validation error", 400, errors.array());
    }
    next();
  },
];

/**
 * Validate update user input
 */
export const validateUpdateUser = [
  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email address"),
  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("fullName")
    .optional()
    .notEmpty()
    .withMessage("Full name cannot be empty"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError("Validation error", 400, errors.array());
    }
    next();
  },
];
