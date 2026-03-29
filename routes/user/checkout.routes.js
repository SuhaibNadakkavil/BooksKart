import express from "express";
import { 
    loadCheckoutPage,
    addAddressFromCheckout,
    editAddressFromCheckout
 } from "../../controllers/user/checkout.controller.js";
import { isAuthenticated } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/checkout", isAuthenticated, loadCheckoutPage);
router.post("/checkout/address", isAuthenticated, addAddressFromCheckout);
router.put("/checkout/address/:id", isAuthenticated, editAddressFromCheckout);

export default router;