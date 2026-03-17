import express from "express";
import authRoutes from "./auth.routes.js";
import profileRoutes from './profile.routes.js'
import homeRoutes from './home.routes.js'
import productRoutes from "./product.routes.js";
import wishlistRoutes from "./wishlist.routes.js";

const router = express.Router();

router.use('/', homeRoutes)
router.use("/", authRoutes);
router.use('/profile', profileRoutes)
router.use("/", productRoutes);
router.use("/", wishlistRoutes);

export default router;