import express from "express";

import { 
    toggleWishlist, 
    checkWishlist, 
    loadWishlistPage,
    removeWishlistItem,
} from "../../controllers/user/wishlist.controller.js";

import { isAuthenticated } from '../../middlewares/auth.middleware.js'

const router = express.Router();

router.post("/wishlist/toggle", toggleWishlist);
router.get("/wishlist/check/:productId/:variantType", checkWishlist);
router.get("/wishlist", isAuthenticated, loadWishlistPage);
router.delete("/wishlist", isAuthenticated, removeWishlistItem);

export default router;