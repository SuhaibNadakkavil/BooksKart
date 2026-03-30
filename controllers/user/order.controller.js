import HTTP_STATUS from "../../utils/httpStatus.js";
import { createOrderService, getOrderSuccessService } from "../../services/user/order.service.js";

export const createOrder = async (req, res, next) => {

  try {

    const userId = req.user._id;
    const { addressId, paymentMethod } = req.body;

    const order = await createOrderService({
      userId,
      addressId,
      paymentMethod
    });

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Order placed successfully",
      orderId: order.orderId
    });

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