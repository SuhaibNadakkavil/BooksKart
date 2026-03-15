import express from "express";

import { verifyAdminAuth } from "../../middlewares/adminAuth.middleware.js";

import {
    loadProductManagement,
    addProduct,
    activateProduct,
    deactivateProduct,
    loadAddProductPage,
    loadEditProductPage,
    updateProduct
} from "../../controllers/admin/productManagement.controller.js";

import { uploadProductImages } from "../../middlewares/uploadProductImages.middleware.js";

const router = express.Router();

router.get(
    "/products",
    verifyAdminAuth,
    loadProductManagement
);

router.get(
    "/products/add",
    verifyAdminAuth,
    loadAddProductPage
);

router.post(
    "/products",
    verifyAdminAuth,
    uploadProductImages,
    addProduct
);

router.get(
  "/products/:id/edit",
  verifyAdminAuth,
  loadEditProductPage
);

router.post(
  "/products/:id",
  verifyAdminAuth,
  uploadProductImages,
  updateProduct
);

router.patch(
    "/products/:id/activate",
    verifyAdminAuth,
    activateProduct
);

router.patch(
    "/products/:id/deactivate",
    verifyAdminAuth,
    deactivateProduct
);

export default router;