import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { AppError } from "../../middleware/errorHandler";

/**
 * Validate create role input
 */
export const validateCreateRole = [
  body("name")
    .notEmpty()
    .withMessage("Role name is required")
    .isString()
    .withMessage("Role name must be a string")
    .isLength({ min: 2, max: 50 })
    .withMessage("Role name must be between 2 and 50 characters"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError("Validation error", 400, errors.array());
    }
    next();
  },
];

/**
 * Validate update role input
 */
export const validateUpdateRole = [
  body("name")
    .optional()
    .isString()
    .withMessage("Role name must be a string")
    .isLength({ min: 2, max: 50 })
    .withMessage("Role name must be between 2 and 50 characters"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError("Validation error", 400, errors.array());
    }
    next();
  },
];
