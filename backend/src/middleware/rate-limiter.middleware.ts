import rateLimit from "express-rate-limit";
import { error } from "node:console";

// General limiter (100 requests per 15 minutes)
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        error: "Too many requests. Please try again after 15 minutes",
    }
});

// Strict limiter for authentication (10 attempts per 15 minutes)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: "Too many authentication attempts. Please try again later.",
    },
});

// Strict limiter for code verification (5 attempts per 15 minutes)
export const codeVerificationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: "Too many code verification attempts. Please try again later.",
    },
});