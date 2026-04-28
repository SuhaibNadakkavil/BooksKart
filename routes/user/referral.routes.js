import express from "express";

import { loadReferralPage } from "../../controllers/user/referral.controller.js";
import { isAuthenticated } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/referral", isAuthenticated, loadReferralPage);

export default router;