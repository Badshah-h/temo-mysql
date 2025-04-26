import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { AppError } from "../../middleware/errorHandler";

/**
 * Validate create permission input
 */
export const validateCreatePermission = [
  body("name")
    .notEmpty()
    .withMessage("Permission name is required")
    .isString()
    .withMessage("Permission name must be a string")
    .isLength({ min: 2, max: 100 })
    .withMessage("Permission name must be between 2 and 100 characters"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
  body("category")
    .optional()
    .isString()
    .withMessage("Category must be a string"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError("Validation error", 400, errors.array());
    }
    next();
  },
];

/**
 * Validate update permission input
 */
export const validateUpdatePermission = [
  body("name")
    .optional()
    .isString()
    .withMessage("Permission name must be a string")
    .isLength({ min: 2, max: 100 })
    .withMessage("Permission name must be between 2 and 100 characters"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
  body("category")
    .optional()
    .isString()
    .withMessage("Category must be a string"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError("Validation error", 400, errors.array());
    }
    next();
  },
];
