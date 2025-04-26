import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { AppError } from "../../middleware/errorHandler";

/**
 * Validate create template input
 */
export const validateCreateTemplate = [
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
  body("content")
    .notEmpty()
    .withMessage("Content is required")
    .isString()
    .withMessage("Content must be a string"),
  body("category")
    .optional()
    .isString()
    .withMessage("Category must be a string"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("isGlobal")
    .optional()
    .isBoolean()
    .withMessage("isGlobal must be a boolean"),
  body("responseFormatId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Response format ID must be a positive integer"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError("Validation error", 400, errors.array());
    }
    next();
  },
];

/**
 * Validate update template input
 */
export const validateUpdateTemplate = [
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
  body("content").optional().isString().withMessage("Content must be a string"),
  body("category")
    .optional()
    .isString()
    .withMessage("Category must be a string"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("isGlobal")
    .optional()
    .isBoolean()
    .withMessage("isGlobal must be a boolean"),
  body("responseFormatId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Response format ID must be a positive integer"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError("Validation error", 400, errors.array());
    }
    next();
  },
];
