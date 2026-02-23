import express from "express";

const router = express.Router()

router.get("/",(req, res) => {
    const isAuth = !!req.session.userId;

  res.render("user/home", {
    layout: 'layouts/userLayouts',
    headerType: "landing",
    title: "Home | BooksKart",
    success:null,
    error:null,
    pageScript:null,
  });
});


export default router