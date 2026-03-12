import express from "express";

import { verifyAdminAuth } from "../../middlewares/adminAuth.middleware.js";

import {
    loadProductManagement,
    addProduct,
    activateProduct,
    deactivateProduct,
    loadAddProductPage
} from "../../controllers/admin/productManagement.controller.js";

import { uploadProductImages } from "../../middlewares/uploadProductImages.middleware.js";


const router = express.Router();



/* =========================================
PRODUCT MANAGEMENT
========================================= */

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

/* =========================================
PRODUCT STATUS
========================================= */

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