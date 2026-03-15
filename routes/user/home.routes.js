import express from "express";
import { loadHome } from "../../controllers/user/home.controller.js";

const router = express.Router();

router.get("/", loadHome);

export default router;