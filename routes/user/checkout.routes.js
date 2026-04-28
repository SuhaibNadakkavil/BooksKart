import express from "express";
import { 
    loadCheckoutPage,
    addAddressFromCheckout,
    editAddressFromCheckout,
    applyCoupon,
    removeCoupon
 } from "../../controllers/user/checkout.controller.js";
import { isAuthenticated } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/checkout", isAuthenticated, loadCheckoutPage);
router.post("/checkout/address", isAuthenticated, addAddressFromCheckout);
router.put("/checkout/address/:id", isAuthenticated, editAddressFromCheckout);
router.post("/checkout/apply-coupon", isAuthenticated, applyCoupon);
router.delete("/checkout/remove-coupon", isAuthenticated, removeCoupon);

export default router;