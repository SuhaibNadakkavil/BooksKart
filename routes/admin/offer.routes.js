import express from "express";
import { verifyAdminAuth } from "../../middlewares/adminAuth.middleware.js";
import { addCategoryOffer, deleteCategoryOffer, updateCategoryOffer } from "../../controllers/admin/offer.controller.js";

const router = express.Router()

router.post("/categories/:id/offer", verifyAdminAuth, addCategoryOffer);
router.patch("/categories/:id/offer", verifyAdminAuth, updateCategoryOffer);
router.delete("/categories/:id/offer", verifyAdminAuth, deleteCategoryOffer);

export default router