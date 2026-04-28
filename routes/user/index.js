import express from "express";
import authRoutes from "./auth.routes.js";
import profileRoutes from './profile.routes.js'
import homeRoutes from './home.routes.js'
import productRoutes from "./product.routes.js";
import wishlistRoutes from "./wishlist.routes.js";
import cartRoutes from "./cart.routes.js";
import checkoutRoutes from './checkout.routes.js'
import orderRoutes from "./order.routes.js";
import walletRoutes from "./wallet.routes.js"
import referralRoutes from "./referral.routes.js";

const router = express.Router();

router.use('/', homeRoutes)
router.use("/", authRoutes);
router.use('/profile', profileRoutes)
router.use("/", productRoutes);
router.use("/", wishlistRoutes);
router.use('/', cartRoutes)
router.use('/', checkoutRoutes)
router.use("/", orderRoutes);
router.use("/", walletRoutes)
router.use("/", referralRoutes);

export default router;