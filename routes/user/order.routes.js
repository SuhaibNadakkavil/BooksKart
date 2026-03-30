import express from "express";
import { isAuthenticated } from "../../middlewares/auth.middleware.js";
import { createOrder, loadOrderSuccessPage } from "../../controllers/user/order.controller.js";

const router = express.Router();

router.post("/orders", isAuthenticated, createOrder);
router.get("/order/success", isAuthenticated, loadOrderSuccessPage);

export default router;