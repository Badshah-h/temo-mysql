import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { AppError } from "../../middleware/errorHandler";

/**
 * Validate create response format input
 */
export const validateCreateResponseFormat = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
  body("structure")
    .notEmpty()
    .withMessage("Structure is required")
    .isObject()
    .withMessage("Structure must be an object"),
  body("category")
    .optional()
    .isString()
    .withMessage("Category must be a string"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("isGlobal")
    .optional()
    .isBoolean()
    .withMessage("isGlobal must be a boolean"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError("Validation error", 400, errors.array());
    }
    next();
  },
];

/**
 * Validate update response format input
 */
export const validateUpdateResponseFormat = [
  body("name")
    .optional()
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
  body("structure")
    .optional()
    .isObject()
    .withMessage("Structure must be an object"),
  body("category")
    .optional()
    .isString()
    .withMessage("Category must be a string"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("isGlobal")
    .optional()
    .isBoolean()
    .withMessage("isGlobal must be a boolean"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError("Validation error", 400, errors.array());
    }
    next();
  },
];
