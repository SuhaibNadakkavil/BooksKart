import express from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router()

router.get("/",(req, res) => {
    const isAuth = !!req.session.userId;

  res.render("user/home", {
    headerType: "landing",
    title: "Home | BooksKart",
    success:null,
    error:null,
    pageScript:null,
  });
});

router.get('/profile', isAuthenticated, (req, res) =>{
    res.json({
        success: true,
        user: req.user,
    })
})

export default router