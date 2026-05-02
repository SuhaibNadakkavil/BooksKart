import express from "express";
import { loadDashboardPage } from "../../controllers/admin/dashboard.controller.js";
import { verifyAdminAuth } from "../../middlewares/adminAuth.middleware.js";

const router = express.Router();

router.get("/dashboard", verifyAdminAuth, loadDashboardPage);

export default router;