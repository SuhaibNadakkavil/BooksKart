import express from "express";
import passport from "passport";

import {
  loadHome,
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

router.get("/", loadHome);

// Get Signup
router.get("/signup", preventAuthPages, loadSignup);
router.get("/verify-otp", loadVerifyOtp);

// Get Login
router.get("/login", preventAuthPages, loadLogin);
router.get("/forgot-password", preventAuthPages, loadForgotPassword);
router.get("/set-new-password", preventAuthPages, loadSetNewPassword);

// Post Signup
router.post("/signup", preventAuthPages, signup);
router.post("/verify-otp", otpVerifyLimiter, verifySignupOTP);
router.post("/resend-otp", otpResendLimiter, resendSignupOTP);

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

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: true,
  }),
  googleCallback
);

router.post("/logout", logout);

export default router;