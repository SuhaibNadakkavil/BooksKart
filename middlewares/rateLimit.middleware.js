import rateLimit from "express-rate-limit";
import HTTP_STATUS from "../utils/httpStatus.js";

// Global Rate Limiter
export const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const isAuth = !!req?.session?.userId;
    return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).render("user/429", {
      title: "Too Many Requests | BooksKart",
      headerType: isAuth ? "main" : "landing",
      success: null,
      error: null,
      pageScript: null,
    });
  },
});

// Login Limiter
export const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // 5 attempts
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).render("user/login", {
      title: "Login | BooksKart",
      headerType: "auth",
      errors: {},
      old: {},
      error: "Too many login attempts. Please try again after 10 minutes.",
      success: null,
      pageScript: "/js/login.js",
    });
  },
});

// OTP Verification Limiter
export const otpVerifyLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const email = req.body?.email || "";
    const mode = req.query?.mode === "reset" ? "reset" : "signup";

    return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).render(
      "user/verify-otp",
      {
        mode,
        title:
          mode === "reset"
            ? "Verify OTP | BooksKart"
            : "Verify Email | BooksKart",
        headerType: "auth",
        error:
          "Too many OTP attempts. Please wait 5 minutes before trying again.",
        success: null,
        email,
        pageScript: "/js/verify-otp.js",
      }
    );
  },
});

// OTP Resend Limiter
export const otpResendLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      message: "Too many resend attempts. Please wait before trying again.",
    });
  },
});