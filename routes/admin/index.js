import express from "express";
import adminAuthRoutes from './adminAuth.routes.js'
import userManagement from "./userManagement.routes.js";

const router = express.Router()

router.use((req, res, next) => {
  res.locals.layout = "layouts/adminLayout";
  next();
});

router.use('/', adminAuthRoutes)
router.use('/', userManagement)

export default router