import express from "express";
import { loadProductDetailsPage, loadShopPage } from "../../controllers/user/product.controller.js";

const router = express.Router();

router.get("/shop", loadShopPage);
router.get("/product/:slug", loadProductDetailsPage);

export default router;