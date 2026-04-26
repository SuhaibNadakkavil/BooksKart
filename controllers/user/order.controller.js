import HTTP_STATUS from "../../utils/httpStatus.js";
import { 
  createOrderService,
  getOrderSuccessService,
  getUserOrdersService,
  getOrderDetailsService,
  cancelOrderItemService,
  returnOrderItemService,
  cancelOrderService,
  returnOrderService,
  generateInvoiceService,
  createRazorpayOrderService,
  verifyPaymentService,
  getOrderFailedService,
  markPaymentFailedService,
  retryPaymentService
} from "../../services/user/order.service.js";

export const createOrder = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { addressId, paymentMethod } = req.body;

    const order = await createOrderService({
      userId,
      addressId,
      paymentMethod
    });

    if (paymentMethod === "cod") {
      return res.status(200).json({
        success: true,
        paymentMethod: "cod",
        orderId: order.orderId
      });
    }

    if (paymentMethod === "razorpay") {
      const razorpayOrder = await createRazorpayOrderService({
        orderId: order.orderId,
        amount: order.totalAmount
      });

      return res.status(200).json({
        success: true,
        paymentMethod: "razorpay",
        orderId: order.orderId,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID
      });
    }

  } catch (err) {

    if (err.type === "CHECKOUT") {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: err.message
      });
    }

    next(err);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    await verifyPaymentService({
      userId,
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    });

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Payment verified"
    });

  } catch (err) {

    if (req.body.orderId) {
      await markPaymentFailedService(req.body.orderId);
    }

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: err.message || "Payment verification failed"
    });
  }
};


export const loadOrderSuccessPage = async (req, res, next) => {

  try {

    const userId = req.user._id;
    const { orderId } = req.query;

    const order = await getOrderSuccessService(userId, orderId);

    res.status(HTTP_STATUS.OK).render("user/orderSuccess", {
      title: "Order Success | BooksKart",
      headerType: "main",
      order,
      success: null,
      error: null,
      pageScript: null,
    });

  } catch (err) {

    if (err.type === "ORDER") {
      req.session.error = err.message;
      return res.redirect("/shop"); // fallback
    }

    next(err);
  }
};

export const loadOrderFailedPage = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { orderId } = req.query;

    const order = await getOrderFailedService(userId, orderId);

    return res.status(HTTP_STATUS.OK).render("user/orderFailed", {
      title: "Payment Failed | BooksKart",
      headerType: "main",
      order,
      success: null,
      error: null,
      pageScript: "/js/orderFailed.js"
    });

  } catch (err) {

    if (err.type === "ORDER") {
      req.session.error = err.message;
      return res.redirect("/orders");
    }

    next(err);
  }
};


export const markPaymentFailed = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    await markPaymentFailedService(orderId);

    return res.status(HTTP_STATUS.OK).json({
      success: true
    });

  } catch (err) {
    next(err);
  }
};


export const retryPayment = async (req, res, next) => {
  try {

    const userId = req.user._id;
    const { orderId } = req.body;

    const data = await retryPaymentService({
      userId,
      orderId
    });

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      paymentMethod: "razorpay",
      ...data
    });

  } catch (err) {

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: err.message
    });
  }
};

export const loadOrdersPage = async (req, res, next) => {

  try {

    const success = req.session.success || null;
    const error = req.session.error || null;

    delete req.session.success;
    delete req.session.error;

    const userId = req.user._id;

    const data = await getUserOrdersService(req.query, userId);

    res.status(HTTP_STATUS.OK).render("user/orders", {

      title: "Orders | BooksKart",
      activePage: 'orders',
      headerType: "main",

      orders: data.orders,
      totalOrders: data.totalOrders,
      page: data.page,
      totalPages: data.totalPages,

      query: data.query,

      success,
      error,

      pageScript: "/js/orders.js"

    });

  } catch (err) {
    next(err);
  }
};


export const loadOrderDetailsPage = async (req, res, next) => {

  try {

    const userId = req.user._id;
    const { orderId } = req.params;

    const success = req.session.success || null;
    const error = req.session.error || null;

    delete req.session.success;
    delete req.session.error;

    const data = await getOrderDetailsService(userId, orderId);

    res.status(HTTP_STATUS.OK).render("user/orderDetails", {

      title: "Order Details | BooksKart",
      headerType: "main",

      order: data.order,
      meta: data.meta,

      success,
      error,

      pageScript: "/js/orderDetails.js"
    });

  } catch (err) {

    if (err.type === "ORDER") {
      req.session.error = err.message;
      return res.redirect("/orders");
    }

    next(err);
  }
};


export const cancelOrderItem = async (req, res, next) => {

  try {

    const { itemId, reason, orderId } = req.body;

    await cancelOrderItemService(req.user._id, orderId, itemId, reason);

    return res.json({ success: true });

  } catch (err) {

    if (["VALIDATION", "ORDER"].includes(err.type)) {
      return res.status(400).json({ message: err.message });
    }

    next(err);
  }
};


export const returnOrderItem = async (req, res, next) => {

  try {

    const { itemId, reason, orderId } = req.body;

    await returnOrderItemService(req.user._id, orderId, itemId, reason);

    return res.json({ success: true });

  } catch (err) {

    if (["VALIDATION", "ORDER"].includes(err.type)) {
      return res.status(400).json({ message: err.message });
    }

    next(err);
  }
};


export const cancelOrder = async (req, res, next) => {

  try {

    const { orderId, reason } = req.body;

    await cancelOrderService(req.user._id, orderId, reason);

    return res.json({ success: true });

  } catch (err) {

    if (["VALIDATION", "ORDER"].includes(err.type)) {
      return res.status(400).json({ message: err.message });
    }

    next(err);
  }
};


export const returnOrder = async (req, res, next) => {

  try {

    const { orderId, reason } = req.body;

    await returnOrderService(req.user._id, orderId, reason);

    return res.json({ success: true });

  } catch (err) {

    if (["VALIDATION", "ORDER"].includes(err.type)) {
      return res.status(400).json({ message: err.message });
    }

    next(err);
  }
};


export const downloadInvoice = async (req, res, next) => {
  try {

    const { orderId } = req.params;

    const pdfBuffer = await generateInvoiceService(
      req.user._id,
      orderId
    );

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=invoice-${orderId}.pdf`
    });

    return res.send(pdfBuffer);

  } catch (err) {
    next(err);
  }
};