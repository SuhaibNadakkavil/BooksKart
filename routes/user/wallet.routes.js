import express from "express";

import { isAuthenticated } from "../../middlewares/auth.middleware.js";

import {
  loadWalletPage,
  createWalletTopupOrder,
  verifyWalletTopup
} from "../../controllers/user/wallet.controller.js";

const router = express.Router();

router.get("/wallet", isAuthenticated, loadWalletPage);
router.post("/wallet/create-order", isAuthenticated, createWalletTopupOrder);
router.post("/wallet/verify-payment", isAuthenticated, verifyWalletTopup);

export default router;