import Order from "../../models/user/order.schema.js";
import mongoose from "mongoose";

export const createOrder = async (data, session = null) => {
  return await Order.create([data], { session }).then(res => res[0]);
};

export const generateOrderId = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${timestamp}-${random}`;
};

export const getUserOrders = async ({
  userId,
  page = 1,
  limit = 5,
  search = "",
  sort = "newest",
  status = "all"
}) => {

  const skip = (page - 1) * limit;

  const matchStage = {
    userId: new mongoose.Types.ObjectId(userId)
  };

  // =============================
  // FILTER (STATUS)
  // =============================
  if (status !== "all") {
    matchStage.orderStatus = status;
  }

  // =============================
  // SEARCH (orderId + item titles)
  // =============================
  if (search) {
    matchStage.$or = [
      { orderId: { $regex: search, $options: "i" } },
      { "items.title": { $regex: search, $options: "i" } }
    ];
  }

  // =============================
  // SORTING
  // =============================
  let sortStage = {};

  switch (sort) {
    case "oldest":
      sortStage = { createdAt: 1 };
      break;
    case "price_low":
      sortStage = { totalAmount: 1 };
      break;
    case "price_high":
      sortStage = { totalAmount: -1 };
      break;
    default:
      sortStage = { createdAt: -1 }; // newest
  }

  // =============================
  // AGGREGATION PIPELINE
  // =============================
  const pipeline = [

    { $match: matchStage },

    // =============================
    // PROJECT MINIMAL DATA
    // =============================
    {
      $project: {
        orderId: 1,
        orderStatus: 1,
        totalAmount: 1,
        createdAt: 1,

        // extract item titles for UI
        itemTitles: {
          $map: {
            input: "$items",
            as: "item",
            in: "$$item.title"
          }
        }
      }
    },

    // =============================
    // FORMAT TITLES (Atomic Habits, Ikigai)
    // =============================
    {
      $addFields: {
        acquisitions: {
          $reduce: {
            input: "$itemTitles",
            initialValue: "",
            in: {
              $cond: [
                { $eq: ["$$value", ""] },
                "$$this",
                { $concat: ["$$value", ", ", "$$this"] }
              ]
            }
          }
        }
      }
    },

    // =============================
    // SORT
    // =============================
    { $sort: sortStage },

    // =============================
    // PAGINATION
    // =============================
    {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limit }
        ],
        totalCount: [
          { $count: "count" }
        ]
      }
    }
  ];

  const result = await Order.aggregate(pipeline);

  const orders = result[0]?.data || [];
  const totalCount = result[0]?.totalCount[0]?.count || 0;

  return {
    orders,
    totalCount,
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit)
  };
};

// Get Single Order
export const getOrderByOrderId = async (orderId, userId) => {
  return await Order.findOne({
    orderId,
    userId
  });
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


export const getOrderDetails = async (orderId, userId) => {
  return await Order.findOne({
    orderId,
    userId
  }).lean();
};


export const requestCancelItem = async (orderId, itemId, reason) => {

  return await Order.updateOne(
    {
      orderId,
      "items._id": itemId,
      "items.status": { $nin: ["cancelled", "returned"] }
    },
    {
      $set: {
        "items.$.status": "cancel_requested",
        "items.$.cancelReason": reason
      }
    }
  );
};


export const requestReturnItem = async (orderId, itemId, reason) => {

  return await Order.updateOne(
    {
      orderId,
      "items._id": itemId,
      "items.status": "delivered"
    },
    {
      $set: {
        "items.$.status": "return_requested",
        "items.$.returnReason": reason
      }
    }
  );
};


export const requestCancelOrder = async (orderId, userId, reason) => {

  return await Order.updateOne(
    { orderId, userId },
    {
      $set: {
        orderStatus: "cancel_requested",
        "items.$[].status": "cancel_requested",
        "items.$[].cancelReason": reason
      }
    }
  );
};


export const requestReturnOrder = async (orderId, userId, reason) => {

  return await Order.updateOne(
    { orderId, userId },
    {
      $set: {
        orderStatus: "return_requested",
        "items.$[].status": "return_requested",
        "items.$[].returnReason": reason
      }
    }
  );
};


export const updatePaymentStatus = async (orderId, status) => {
  return await Order.updateOne(
    { orderId },
    { $set: { paymentStatus: status } }
  );
};