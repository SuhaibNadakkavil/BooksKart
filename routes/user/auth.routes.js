import express from "express";
import passport from "passport";

import {
  loadSignup,
  loadLogin,
  loadVerifyOtp,
  loadForgotPassword,
  loadSetNewPassword,
  signup,
  login,
  logout,
  verifySignupOTP,
  resendSignupOTP,
  sendForgotPasswordOTP,
  verifyResetOTP,
  resendResetOTP,
  setNewPassword,
  googleCallback,
} from "../../controllers/user/auth.controller.js";

import { preventAuthPages } from "../../middlewares/guest.middleware.js";
import { loginLimiter, otpResendLimiter, otpVerifyLimiter } from "../../middlewares/rateLimit.middleware.js";

const router = express.Router();

// Get Signup
router.get("/signup", preventAuthPages, loadSignup);
router.get("/verify-otp", preventAuthPages, loadVerifyOtp);

// Get Login
router.get("/login", preventAuthPages, loadLogin);
router.get("/forgot-password", preventAuthPages, loadForgotPassword);
router.get("/set-new-password", preventAuthPages, loadSetNewPassword);

// Post Signup
router.post("/signup", preventAuthPages, signup);
router.post("/verify-otp", preventAuthPages, otpVerifyLimiter, verifySignupOTP);
router.post("/resend-otp", preventAuthPages, otpResendLimiter, resendSignupOTP);

// Post Login
router.post("/login", preventAuthPages, loginLimiter, login);
router.post("/forgot-password", preventAuthPages, sendForgotPasswordOTP);
router.post("/verify-reset-otp", preventAuthPages, otpVerifyLimiter, verifyResetOTP);
router.post("/resend-reset-otp", preventAuthPages, otpResendLimiter, resendResetOTP);
router.post("/set-new-password", preventAuthPages, setNewPassword);

// OAuth (Google)
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/auth/google/callback", (req, res, next) => {
  passport.authenticate("google", async (err, user) => {
    try {
      if (err) {
        req.session.error = err.message || "Google authentication failed";
        return res.redirect("/login");
      }

      if (!user) {
        req.session.error = "Authentication failed";
        return res.redirect("/login");
      }

      req.user = user;
      return googleCallback(req, res, next);
    } catch (error) {
      next(error);
    }
  })(req, res, next);
});

router.post("/logout", logout);

export default router;