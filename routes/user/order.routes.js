import express from "express";
import { isAuthenticated } from "../../middlewares/auth.middleware.js";
import { 
    createOrder, 
    loadOrderSuccessPage, 
    loadOrdersPage,
    loadOrderDetailsPage,
    cancelOrderItem,
    returnOrderItem,
    cancelOrder,
    returnOrder,
    downloadInvoice,
    verifyPayment,
    loadOrderFailedPage,
    markPaymentFailed,
    retryPayment
} from "../../controllers/user/order.controller.js";

const router = express.Router();

router.post("/orders", isAuthenticated, createOrder);
router.post("/orders/verify-payment", isAuthenticated, verifyPayment);
router.post("/orders/payment-failed", isAuthenticated, markPaymentFailed);
router.post("/orders/retry-payment", isAuthenticated, retryPayment);
router.get("/order/success", isAuthenticated, loadOrderSuccessPage);
router.get("/order/failed", isAuthenticated, loadOrderFailedPage);
router.get("/orders", isAuthenticated, loadOrdersPage);
router.get("/orders/:orderId", isAuthenticated, loadOrderDetailsPage);
router.post("/orders/item/cancel", isAuthenticated, cancelOrderItem);
router.post("/orders/item/return", isAuthenticated, returnOrderItem);
router.post("/orders/cancel", isAuthenticated, cancelOrder);
router.post("/orders/return", isAuthenticated, returnOrder);
router.get("/orders/:orderId/invoice", isAuthenticated, downloadInvoice);

export default router;