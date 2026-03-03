import express from "express";
import authRoutes from "./auth.routes.js";
import profileRoutes from './profile.routes.js'

const router = express.Router();

router.use("/", authRoutes);
router.use('/profile', profileRoutes)

export default router;