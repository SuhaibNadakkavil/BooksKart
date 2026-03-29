import express from "express";
import { isAuthenticated } from "../../middlewares/auth.middleware.js";
import { createOrder } from "../../controllers/user/order.controller.js";

const router = express.Router();

router.post("/orders", isAuthenticated, createOrder);

export default router;