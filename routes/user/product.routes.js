import express from "express";
import { loadShopPage } from "../../controllers/user/product.controller.js";

const router = express.Router();

router.get("/shop", loadShopPage);

export default router;