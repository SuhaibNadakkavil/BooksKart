import express from "express";
import { signup, login, logout } from "../controllers/auth.controller.js";

const router = express.Router()

router.get("/login", (req, res) => {
  res.render("user/login", {
    title: "Login | BooksKart",
    headerType: "auth",
    error: null,
    errors: {},
    old: {},
    pageScript: "/js/login.js"
  });
});


router.get("/signup", (req, res) => {
  res.render("user/signup", {
    title: "Signup | BooksKart",
    headerType: "auth",
    errors: {},
    old: {},
    error: null,
    pageScript: "/js/signup.js",
  });
});

router.post('/signup', signup)
router.post('/login', login)
router.post('/logout', logout)

export default router