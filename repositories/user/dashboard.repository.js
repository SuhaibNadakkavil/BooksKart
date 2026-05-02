import Order from "../../models/user/order.schema.js";
import User from "../../models/user/userSchema.js";
import Product from "../../models/user/product.schema.js";


// =====================================
// TOTAL METRICS
// =====================================
export const getDashboardMetrics = async () => {

  const [orders, users, products] = await Promise.all([
    Order.find().lean(),
    User.countDocuments({ role: "user" }),
    Product.countDocuments({ isDeleted: false })
  ]);

  let totalRevenue = 0;

  for (const order of orders) {
    totalRevenue += order.totalAmount || 0;
  }

  return {
    totalRevenue,
    totalOrders: orders.length,
    totalUsers: users,
    totalProducts: products
  };
};


// =====================================
// REVENUE CHART DATA
// =====================================
export const getRevenueChartData = async ({
  filter = "monthly"
}) => {

  let groupFormat;

  if (filter === "yearly") {
    groupFormat = { $year: "$createdAt" };
  } else if (filter === "weekly") {
    groupFormat = { $isoWeek: "$createdAt" };
  } else {
    // default monthly
    groupFormat = { $month: "$createdAt" };
  }

  return await Order.aggregate([
    {
      $group: {
        _id: groupFormat,
        total: { $sum: "$totalAmount" }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};


// =====================================
// TOP SELLING PRODUCTS
// =====================================
export const getTopSellingProducts = async () => {

  return await Order.aggregate([
    { $unwind: "$items" },

    {
      $group: {
        _id: "$items.productId",
        totalSold: { $sum: "$items.quantity" },
        revenue: { $sum: "$items.itemTotal" }
      }
    },

    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product"
      }
    },

    { $unwind: "$product" },

    {
      $project: {
        name: "$product.title",
        totalSold: 1,
        revenue: 1
      }
    },

    { $sort: { totalSold: -1 } },
    { $limit: 10 }
  ]);
};


// =====================================
// TOP SELLING CATEGORIES
// =====================================
export const getTopSellingCategories = async () => {

  return await Order.aggregate([
    { $unwind: "$items" },

    {
      $lookup: {
        from: "products",
        localField: "items.productId",
        foreignField: "_id",
        as: "product"
      }
    },

    { $unwind: "$product" },

    {
      $group: {
        _id: "$product.category",
        totalSold: { $sum: "$items.quantity" },
        revenue: { $sum: "$items.itemTotal" }
      }
    },

    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "_id",
        as: "category"
      }
    },

    { $unwind: "$category" },

    {
      $project: {
        name: "$category.name",
        totalSold: 1,
        revenue: 1
      }
    },

    { $sort: { totalSold: -1 } },
    { $limit: 10 }
  ]);
};