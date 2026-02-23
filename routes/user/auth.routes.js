import express from "express";
import { signup, login, logout, loadSignup, loadLogin } from "../../controllers/user/auth.controller.js";

const router = express.Router()

router.get("/login", loadLogin);
router.get("/signup", loadSignup)

router.post('/signup', signup)
router.post('/login', login)
router.post('/logout', logout)

export default router