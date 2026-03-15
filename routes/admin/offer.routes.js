import express from "express";
import { verifyAdminAuth } from "../../middlewares/adminAuth.middleware.js";
import { addCategoryOffer, addProductOffer, deleteCategoryOffer, deleteProductOffer, updateCategoryOffer, updateProductOffer } from "../../controllers/admin/offer.controller.js";

const router = express.Router()

router.post("/categories/:id/offer", verifyAdminAuth, addCategoryOffer);
router.patch("/categories/:id/offer", verifyAdminAuth, updateCategoryOffer);
router.delete("/categories/:id/offer", verifyAdminAuth, deleteCategoryOffer);

router.post("/products/:id/offer", verifyAdminAuth, addProductOffer);
router.patch("/products/:id/offer", verifyAdminAuth, updateProductOffer);
router.delete("/products/:id/offer",verifyAdminAuth, deleteProductOffer);

export default router