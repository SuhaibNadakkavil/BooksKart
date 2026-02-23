import express from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from './user.routes.js'

const router = express.Router();

router.use((req, res, next) => {
  res.locals.layout = "layouts/userLayouts";
  next();
});

router.use("/", authRoutes);
router.use('/', userRoutes)

export default router;