import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { AppError } from "../../middleware/errorHandler";

/**
 * Validate process message input
 */
export const validateProcessMessage = [
  body("templateId")
    .isInt({ min: 1 })
    .withMessage("Template ID must be a positive integer"),
  body("responseFormatId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Response format ID must be a positive integer"),
  body("query")
    .notEmpty()
    .withMessage("Query is required")
    .isString()
    .withMessage("Query must be a string"),
  body("variables")
    .optional()
    .isObject()
    .withMessage("Variables must be an object"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError("Validation error", 400, errors.array());
    }
    next();
  },
];
