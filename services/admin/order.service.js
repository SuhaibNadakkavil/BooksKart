import * as orderRepo from "../../repositories/user/order.repository.js";
import Order from "../../models/user/order.schema.js";
import { walletRefundService } from "../user/wallet.service.js";

// =============================
// GET ADMIN ORDERS
// =============================
export const getAdminOrdersService = async (query) => {

  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 5;

  const search = query.search?.trim() || "";
  const sort = query.sort || "newest";
  const status = query.status || "all";

  const data = await orderRepo.getAdminOrders({
    page,
    limit,
    search,
    sort,
    status
  });

  return {
    orders: data.orders,
    totalOrders: data.totalCount,
    page: data.currentPage,
    totalPages: data.totalPages,
    query
  };
};



// =============================
// GET ORDER DETAILS
// =============================
export const getAdminOrderDetailsService = async (orderId) => {

  const order = await orderRepo.getAdminOrderByOrderId(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  const items = order.items;

  const allPending = items.every(i => i.status === "pending");
  const allCancelled = items.every(i => i.status === "cancelled");
  const allReturned = items.every(i => i.status === "returned");
  const allReturnRequested = items.every(i => i.status === "return_requested");

  // =============================
  // DERIVED ORDER STATUS
  // =============================
  if (allPending) {
    order.orderStatus = "pending";
  } 
  else if (allCancelled) {
    order.orderStatus = "cancelled";
  } 
  else if (allReturned) {
    order.orderStatus = "returned";
  } 
  else if (allReturnRequested) {
    order.orderStatus = "return_requested";
  } 
  else {
    const hasActiveFlow = items.some(i =>
      ["placed", "shipped", "out_for_delivery"].includes(i.status)
    );

    if (hasActiveFlow) {
      order.orderStatus = order.orderStatus; // keep actual flow
    } else {
      order.orderStatus = "delivered";
    }
  }

  return order;
};



// =============================
// STATUS TRANSITION RULES
// =============================
const allowedTransitions = {
  pending: [],
  placed: ["shipped", "cancelled"],
  shipped: ["out_for_delivery"],
  out_for_delivery: ["delivered"],
  delivered: [],
  cancelled: [],
  returned: []
};



// =============================
// UPDATE ORDER STATUS
// =============================
export const updateOrderStatusService = async (orderId, newStatus) => {

  const order = await orderRepo.getAdminOrderByOrderId(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  const currentStatus = order.orderStatus;

  // VALIDATION
  if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
    throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
  }

  if (newStatus === "cancelled" && order.orderStatus !== "placed") {
    throw new Error("Only placed orders can be cancelled");
  }

  // =============================
  // SIDE EFFECTS
  // =============================

  if (newStatus === "cancelled") {

  const restorableItems = order.items.filter(
    i => !["cancelled", "returned"].includes(i.status)
  );

  await orderRepo.restoreStock(restorableItems);

  await Order.updateOne(
    { orderId },
    {
      $set: {
        "items.$[].status": "cancelled"
      }
    }
  );

  const refundable =
    ["paid", "partially_refunded"].includes(
      order.paymentStatus
    );

  const noCodRefund =
    order.paymentMethod === "cod";

  if (refundable && !noCodRefund) {

    const refundAmount =
      restorableItems.reduce(
        (sum, item) => sum + (
          item.finalItemTotal ||
          item.itemTotal
        ),
        0
      );

    if (refundAmount > 0) {
      await walletRefundService({
        userId: order.userId,
        amount: refundAmount,
        referenceId: orderId
      });
    }
  }
}

  // DELIVERED + COD → MARK PAID
  if (newStatus === "delivered" && order.paymentMethod === "cod") {
    await Order.updateOne(
      { orderId },
      { $set: { paymentStatus: "paid" } }
    );
  }

  // UPDATE ORDER STATUS
  await orderRepo.updateOrderStatus(orderId, newStatus);

  await orderRepo.syncPaymentRefundStatus(orderId);

  // SYNC ITEMS (avoid cancelled/returned override)
  const syncableStatuses = [
    "placed",
    "shipped",
    "out_for_delivery",
    "delivered"
  ];

  if (syncableStatuses.includes(newStatus)) {
    await Order.updateOne(
      { orderId },
      {
        $set: {
          "items.$[elem].status": newStatus
        }
      },
      {
        arrayFilters: [
          {
            "elem.status": {
              $nin: ["cancelled", "returned"]
            }
          }
        ]
      }
    );
  }

  return {
    message: "Order and items status updated successfully"
  };
};



// =============================
// UPDATE ITEM STATUS
// =============================
export const updateOrderItemStatusService = async ({
  orderId,
  itemId,
  status,
  reason
}) => {

  const order = await orderRepo.getAdminOrderByOrderId(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  const item = order.items.find(i => i._id.toString() === itemId);

  if (!item) {
    throw new Error("Item not found");
  }

  // VALIDATION
  if (
    (status === "returned" && item.status !== "return_requested")
  ) {
    throw new Error("Invalid request handling");
  }

  // UPDATE ITEM
  await orderRepo.updateOrderItemStatus(orderId, itemId, {
    status,
    cancelReason: undefined, // remove completely
    returnReason: status === "returned" ? reason : undefined
  });

  // RESTORE STOCK
  if (status === "cancelled" || status === "returned") {
    await orderRepo.restoreStock([item]);
  }

  // ========================
  // REFUND LOGIC
  // ========================
  const refundablePayment =
    ["paid", "partially_refunded"]
      .includes(order.paymentStatus);

  const noCodRefund =
    order.paymentMethod === "cod";

  if (
    refundablePayment &&
    !noCodRefund
  ) {
    await walletRefundService({
      userId: order.userId,
      amount:
        item.finalItemTotal ||
        item.itemTotal,
      referenceId: orderId
    });
  }

  await orderRepo.syncOrderStatusWithItems(orderId);
  await orderRepo.syncPaymentRefundStatus(orderId);

  return {
    message: `Item ${status} successfully`
  };
};

const calculateRefundAmount = (
  item
) => {

  return (
    item.finalItemTotal ||
    item.itemTotal
  );
};