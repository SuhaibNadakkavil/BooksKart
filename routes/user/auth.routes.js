import express from "express";
import { signup, login, logout, loadSignup, loadLogin, loadVerifyOtp, verifySignupOTP, resendSignupOTP, loadForgotPassword, sendForgotPasswordOTP, verifyResetOTP, loadSetNewPassword, resendResetOTP, setNewPassword, loadHome } from "../../controllers/user/auth.controller.js";
import passport from "passport";
import { googleCallback } from "../../controllers/user/auth.controller.js";
import { preventAuthPages } from "../../middlewares/guest.middleware.js";


const router = express.Router()

router.get('/', loadHome)
router.get("/login", preventAuthPages, loadLogin)
router.get("/signup", preventAuthPages, loadSignup)
router.get("/verify-otp", preventAuthPages, loadVerifyOtp)
router.get('/forgot-password', preventAuthPages, loadForgotPassword)
router.get("/set-new-password", preventAuthPages, loadSetNewPassword)

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  googleCallback
);

router.post('/forgot-password', sendForgotPasswordOTP)
router.post('/verify-otp', verifySignupOTP)
router.post('/resend-otp', resendSignupOTP)
router.post("/resend-reset-otp", resendResetOTP)
router.post("/verify-reset-otp", verifyResetOTP)
router.post('/set-new-password', setNewPassword)
router.post('/signup', signup)
router.post('/login', login)
router.post('/logout', logout)

export default router