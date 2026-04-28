import * as salesRepo from "../../repositories/user/sales.repository.js";


// =====================================
// HELPER: CALCULATE REFUND FROM ITEMS
// =====================================
const calculateRefundAmount = (order) => {

  let refund = 0;

  for (const item of order.items) {

    if (item.status === "cancelled" || item.status === "returned") {
      refund += item.itemTotal;
    }
  }

  return refund;
};


// =====================================
// GET SALES REPORT
// =====================================
export const getSalesReportService = async ({
  from,
  to,
  page = 1,
  limit = 10
}) => {

  const { orders, total } =
    await salesRepo.getOrdersByDateRange({
      from,
      to,
      page,
      limit
    });

  let totalOrders = total;
  let grossRevenue = 0;
  let totalDiscount = 0;
  let totalRefund = 0;

  const tableData = [];

  for (const order of orders) {

    const refundAmount = calculateRefundAmount(order);

    grossRevenue += order.subtotal || 0;
    totalDiscount += order.discount || 0;
    totalRefund += refundAmount;

    const netAmount =
      (order.totalAmount || 0) - refundAmount;

    tableData.push({
      orderId: order.orderId,
      date: order.createdAt,
      paymentMethod: order.paymentMethod,
      status: order.orderStatus,
      gross: order.subtotal || 0,
      discount: order.discount || 0,
      refund: refundAmount,
      net: netAmount
    });
  }

  const netRevenue =
    grossRevenue - totalDiscount - totalRefund;

  return {
    summary: {
      totalOrders,
      grossRevenue,
      totalDiscount,
      totalRefund,
      netRevenue
    },
    tableData,

    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    }
  };
};