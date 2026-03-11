import express from "express";
import { verifyAdminAuth } from "../../middlewares/adminAuth.middleware.js";
import { activateCategory, createCategory, deactivateCategory, loadCategoryManagement, updateCategory } from "../../controllers/admin/categoryManagement.controller.js";

const router = express.Router()

router.get('/categories', verifyAdminAuth, loadCategoryManagement)
router.post('/categories', verifyAdminAuth, createCategory)
router.post("/categories/:id", verifyAdminAuth, updateCategory)
router.patch("/categories/:id/activate", verifyAdminAuth, activateCategory)
router.patch("/categories/:id/deactivate", verifyAdminAuth, deactivateCategory)

export default router