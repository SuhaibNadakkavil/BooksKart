import express from "express";
import adminAuthRoutes from './adminAuth.routes.js'
import userManagement from "./userManagement.routes.js";
import categoryManagement from './categoryManagement.routes.js'
import offerRoutes from './offer.routes.js'
import productManagement from './productManagement.routes.js'
import orderRoutes from "./order.routes.js";
import couponRoutes from "./coupon.routes.js"
import salesRoutes from "./sales.routes.js";
import dashboardRoutes from "./dashboard.routes.js";

const router = express.Router()

router.use((req, res, next) => {
  res.locals.layout = "layouts/adminLayout";
  next();
});

router.use('/', adminAuthRoutes)
router.use('/', userManagement)
router.use('/', categoryManagement)
router.use('/', offerRoutes)
router.use('/', productManagement)
router.use("/", orderRoutes);
router.use("/", couponRoutes)
router.use("/", salesRoutes);
router.use("/", dashboardRoutes);

export default router