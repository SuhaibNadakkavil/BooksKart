import Order from "../../models/user/order.schema.js";
import mongoose from "mongoose";
import Product from "../../models/user/product.schema.js";

export const createOrder = async (data, session = null) => {
  return await Order.create([data], { session }).then(res => res[0]);
};

export const updatePaymentStatus = async (orderId, status) => {
  return await Order.updateOne(
    { orderId },
    { $set: { paymentStatus: status } }
  );
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


export const getOrderDetails = async (orderId, userId) => {
  return await Order.findOne({
    orderId,
    userId
  }).lean();
};


export const requestCancelItem = async (orderId, itemId, reason) => {

  const update = {
    "items.$.status": "cancelled"
  };

  if (reason) {
    update["items.$.cancelReason"] = reason;
  }

  return await Order.updateOne(
    {
      orderId,
      items: {
        $elemMatch: {
          _id: itemId,
          status: { $nin: ["cancelled", "returned"] }
        }
      }
    },
    {
      $set: update
    }
  );
};


export const requestReturnItem = async (orderId, itemId, reason) => {

  return await Order.updateOne(
    {
      orderId,
      items: {
        $elemMatch: {
          _id: itemId,
          status: "delivered"
        }
      }
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

  const update = {
    orderStatus: "cancelled",
    "items.$[].status": "cancelled"
  };

  if (reason) {
    update["items.$[].cancelReason"] = reason;
  }

  return await Order.updateOne(
    { orderId, userId },
    {
      $set: update
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


export const getAdminOrders = async ({
  page = 1,
  limit = 5,
  search = "",
  sort = "newest",
  status = "all"
}) => {

  const skip = (page - 1) * limit;

  // =============================
  // MATCH STAGE
  // =============================
  const matchStage = {};

  // STATUS FILTER
  if (status !== "all") {
    matchStage.orderStatus = status;
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
    // JOIN USER (for name + email)
    // =============================
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user"
      }
    },

    { $unwind: "$user" },

    // =============================
    // SEARCH (AFTER LOOKUP)
    // =============================
    ...(search ? [{
      $match: {
        $or: [
          { orderId: { $regex: search, $options: "i" } },
          { "user.name": { $regex: search, $options: "i" } },
          { "user.email": { $regex: search, $options: "i" } }
        ]
      }
    }] : []),

    // =============================
    // PROJECT MINIMAL DATA
    // =============================
    {
      $project: {
        orderId: 1,
        orderStatus: 1,
        totalAmount: 1,
        paymentMethod: 1,
        createdAt: 1,

        customerName: "$user.name",
        customerEmail: "$user.email"
      }
    },

    // =============================
    // SORT
    // =============================
    { $sort: sortStage },

    // =============================
    // PAGINATION + COUNT
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

// =============================
// GET SINGLE ORDER (ADMIN)
// =============================
export const getAdminOrderByOrderId = async (orderId) => {

  const order = await Order.aggregate([

    {
      $match: { orderId }
    },

    // =============================
    // JOIN USER
    // =============================
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user"
      }
    },

    { $unwind: "$user" },

    // =============================
    // PROJECT CLEAN DATA
    // =============================
    {
      $project: {
        orderId: 1,
        orderStatus: 1,
        paymentMethod: 1,
        paymentStatus: 1,

        subtotal: 1,
        discount: 1,
        shipping: 1,
        totalAmount: 1,

        address: 1,
        items: 1,

        createdAt: 1,
        updatedAt: 1,

        customer: {
          name: "$user.name",
          email: "$user.email"
        }
      }
    }

  ]);

  return order[0] || null;
};



// =============================
// UPDATE ORDER STATUS
// =============================
export const updateOrderStatus = async (orderId, newStatus) => {

  return await Order.findOneAndUpdate(
    { orderId },
    {
      $set: {
        orderStatus: newStatus
      }
    },
    { new: true }
  );
};



// =============================
// UPDATE ITEM STATUS
// =============================
export const updateOrderItemStatus = async (
  orderId,
  itemId,
  updateData
) => {

  return await Order.findOneAndUpdate(
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
    },
    { new: true }
  );
};



// =============================
// RESTORE STOCK (CRITICAL)
// =============================
export const restoreStock = async (items) => {

  const bulkOps = items.map(item => {

    const normalizedVariant = item.variantType.toLowerCase();

    return {
      updateOne: {
        filter: {
          _id: item.productId,
          "variants.type": { $regex: `^${normalizedVariant}$`, $options: "i" }
        },
        update: {
          $inc: {
            "variants.$.stock": item.quantity
          }
        }
      }
    };
  });

  if (bulkOps.length > 0) {
    await Product.bulkWrite(bulkOps);
  }
};

// =============================
// SYNC ORDER STATUS WITH ITEMS
// =============================
export const syncOrderStatusWithItems = async (orderId) => {

  const order = await Order.findOne({ orderId });

  if (!order) return;

  const items = order.items;

  const allCancelled = items.every(i => i.status === "cancelled");
  const allReturned = items.every(i => i.status === "returned");
  const allReturnRequested = items.every(i => i.status === "return_requested");

  let newStatus = null;

  if (allCancelled) newStatus = "cancelled";
  else if (allReturned) newStatus = "returned";
  else if (allReturnRequested) newStatus = "return_requested";

  if (newStatus) {
    await Order.updateOne(
      { orderId },
      { $set: { orderStatus: newStatus } }
    );
  }
};


export const updateRazorpayDetails = async ({
  orderId,
  razorpayOrderId
}) => {
  return await Order.updateOne(
    { orderId },
    {
      $set: {
        razorpayOrderId
      }
    }
  );
};

export const markOrderPaid = async ({
  orderId,
  razorpayPaymentId,
  razorpaySignature
}) => {
  return await Order.updateOne(
    { orderId },
    {
      $set: {
        paymentStatus: "paid",
        razorpayPaymentId,
        razorpaySignature
      }
    }
  );
};