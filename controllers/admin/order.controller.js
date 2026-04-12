import { 
    getAdminOrdersService,
    getAdminOrderDetailsService,
    updateOrderStatusService,
    updateOrderItemStatusService
} from "../../services/admin/order.service.js";
import HTTP_STATUS from "../../utils/httpStatus.js";

export const loadAdminOrdersPage = async (req, res, next) => {
  try {

    // =============================
    // FLASH MESSAGES
    // =============================
    const success = req.session.success || null;
    const error = req.session.error || null;

    delete req.session.success;
    delete req.session.error;

    // =============================
    // SERVICE CALL
    // =============================
    const data = await getAdminOrdersService(req.query);

    // =============================
    // RENDER
    // =============================
    res.status(HTTP_STATUS.OK).render("admin/orders", {
      title: "Admin Orders | BooksKart",
      activePage: "orders",
      
      orders: data.orders,
      totalOrders: data.totalOrders,
      page: data.page,
      totalPages: data.totalPages,

      query: data.query,

      success,
      error,

      pageScript: "/js/admin-orders.js"
    });

  } catch (err) {
    next(err);
  }
};


// =============================
// LOAD ORDER DETAILS PAGE
// =============================
export const loadAdminOrderDetailsPage = async (req, res, next) => {
  try {

    const { orderId } = req.params;

    const success = req.session.success || null;
    const error = req.session.error || null;

    delete req.session.success;
    delete req.session.error;

    const order = await getAdminOrderDetailsService(orderId);

    res.status(HTTP_STATUS.OK).render("admin/order-details", {
      title: `Order ${orderId} | BooksKart`,
      activePage: "orders",

      order,

      success,
      error,

      pageScript: "/js/admin-order-details.js"
    });

  } catch (err) {
    next(err);
  }
};



// =============================
// UPDATE ORDER STATUS
// =============================
export const updateAdminOrderStatus = async (req, res, next) => {
  try {

    const { orderId } = req.params;
    const { status } = req.body;

    const result = await updateOrderStatusService(orderId, status);

    req.session.success = result.message;

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: result.message
    });

  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Something went wrong"
    });
  }
};



// =============================
// HANDLE ITEM CANCEL / RETURN
// =============================
export const updateAdminOrderItemStatus = async (req, res, next) => {
  try {

    const { orderId, itemId } = req.params;
    const { status, reason } = req.body;

    const result = await updateOrderItemStatusService({
      orderId,
      itemId,
      status,
      reason
    });

    req.session.success = result.message;

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: result.message
    });

  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Something went wrong"
    });
  }
};