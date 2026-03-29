import HTTP_STATUS from "../../utils/httpStatus.js";
import { createOrderService } from "../../services/user/order.service.js";

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