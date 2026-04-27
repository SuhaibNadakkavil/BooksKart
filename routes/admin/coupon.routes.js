import express from "express";

import {
  loadCouponsPage,
  createCoupon,
  updateCoupon,
  toggleCouponStatus,
  deleteCoupon
} from "../../controllers/admin/coupon.controller.js";

import { verifyAdminAuth } from "../../middlewares/adminAuth.middleware.js";

const router = express.Router();

router.get("/coupons", verifyAdminAuth, loadCouponsPage);
router.post("/coupons", verifyAdminAuth, createCoupon);
router.put("/coupons/:couponId", verifyAdminAuth, updateCoupon);
router.patch("/coupons/:couponId/toggle", verifyAdminAuth, toggleCouponStatus);
router.delete("/coupons/:couponId", verifyAdminAuth, deleteCoupon);

export default router;