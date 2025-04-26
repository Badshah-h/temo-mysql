import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

// Create a rate limiter for general API endpoints
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Too many requests from this IP, please try again after 15 minutes",
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      message: "Too many requests, please try again later.",
    });
  },
});

// Create a stricter rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 login/register attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  message:
    "Too many login attempts from this IP, please try again after an hour",
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      message: "Too many authentication attempts, please try again later.",
    });
  },
});

// Create a rate limiter for conversation processing
export const conversationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 conversation requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many conversation requests, please try again after a minute",
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      message:
        "Rate limit exceeded for conversation processing. Please try again later.",
    });
  },
});
