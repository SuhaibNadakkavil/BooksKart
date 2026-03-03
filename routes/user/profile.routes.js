import express from "express";
import { isAuthenticated } from "../../middlewares/auth.middleware.js";
import { loadProfile } from "../../controllers/user/profile.controller.js";

const router = express.Router()

router.get('/', isAuthenticated, loadProfile)

export default router