import express from "express";
import { 
    loadAdminOrdersPage,
    loadAdminOrderDetailsPage,
    updateAdminOrderStatus,
    updateAdminOrderItemStatus
} from "../../controllers/admin/order.controller.js";

import { verifyAdminAuth } from "../../middlewares/adminAuth.middleware.js";

const router = express.Router();

router.get("/orders", verifyAdminAuth, loadAdminOrdersPage);
router.get("/orders/:orderId", verifyAdminAuth, loadAdminOrderDetailsPage);
router.patch("/orders/:orderId/status", verifyAdminAuth, updateAdminOrderStatus);
router.patch("/orders/:orderId/items/:itemId/status", verifyAdminAuth, updateAdminOrderItemStatus);

export default router;