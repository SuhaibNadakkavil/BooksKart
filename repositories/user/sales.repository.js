import Order from "../../models/user/order.schema.js";

// ==============================
// GET ORDERS BY DATE RANGE
// ==============================
export const getOrdersByDateRange = async ({
  from,
  to,
  page = 1,
  limit = 10
}) => {

  const filter = {};

  if (from && to) {
    filter.createdAt = {
      $gte: new Date(from),
      $lte: new Date(to)
    };
  }

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Order.countDocuments(filter)
  ]);

  return {
    orders,
    total
  };
};