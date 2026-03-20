import express from "express";
import {
  loadCartPage,
  addToCart,
  updateCartQuantity,
  removeCartItem,
  getCartCount
} from "../../controllers/user/cart.controller.js";

import { isAuthenticated } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/cart/add", addToCart);
router.get("/cart", isAuthenticated, loadCartPage);
router.patch("/cart/quantity", isAuthenticated, updateCartQuantity);
router.delete("/cart", isAuthenticated, removeCartItem);

// Navbar cart icon live count
router.get("/cart/count", getCartCount);

export default router;