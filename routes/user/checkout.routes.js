import express from "express";
import { loadCheckoutPage } from "../../controllers/user/checkout.controller.js";
import { isAuthenticated } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/checkout", isAuthenticated, loadCheckoutPage);

export default router;