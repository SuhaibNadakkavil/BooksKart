import Order from "../../models/user/order.schema.js";

export const createOrder = async (data, session = null) => {
  return await Order.create([data], { session }).then(res => res[0]);
};

export const generateOrderId = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${timestamp}-${random}`;
};

export const getUserOrders = async (userId, page = 1, limit = 10) => {

  const skip = (page - 1) * limit;

  const orders = await Order.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return orders;
};

// Get Single Order
export const getOrderById = async (orderId, userId) => {
  return await Order.findOne({ orderId, userId });
};


// Update Order Status (Admin)
export const updateOrderStatus = async (orderId, status) => {
  return await Order.findOneAndUpdate(
    { orderId },
    { orderStatus: status },
    { new: true }
  );
};


// Update Item Status (Cancel / Return)
export const updateOrderItemStatus = async (
  orderId,
  itemId,
  updateData
) => {

  return await Order.updateOne(
    {
      orderId,
      "items._id": itemId
    },
    {
      $set: {
        "items.$.status": updateData.status,
        "items.$.cancelReason": updateData.cancelReason,
        "items.$.returnReason": updateData.returnReason
      }
    }
  );
};


