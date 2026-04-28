import express from "express";
import { 
    loadSalesReportPage,
    exportSalesPDF,
    exportSalesExcel
 } from "../../controllers/admin/sales.controller.js";
import { verifyAdminAuth } from "../../middlewares/adminAuth.middleware.js";

const router = express.Router();

router.get("/sales-report", verifyAdminAuth, loadSalesReportPage);
router.get("/sales-report/export/pdf", verifyAdminAuth, exportSalesPDF);
router.get("/sales-report/export/excel", verifyAdminAuth, exportSalesExcel);

export default router;