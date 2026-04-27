import puppeteer from "puppeteer-core";
import ejs from "ejs";
import path from "path";
import fs from "fs";
import crypto from "crypto";

import * as cartRepo from "../../repositories/user/cart.repository.js";
import * as orderRepo from "../../repositories/user/order.repository.js";
import * as addressRepo from "../../repositories/user/address.repo.js";
import { validateCheckoutService } from "./checkout.service.js";
import { walletDebitPaymentService, walletRefundService } from "./wallet.service.js";
import Product from "../../models/user/product.schema.js";
import Order from "../../models/user/order.schema.js";
import razorpayInstance from '../../config/razorpay.js'

const normalizeVariantType = (type) => {
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
};

export const createOrderService = async ({
  userId,
  addressId,
  paymentMethod
}) => {

  // =============================
  // VALIDATE CHECKOUT
  // =============================
  const checkoutData = await validateCheckoutService(userId);

  // =============================
  // ADDRESS
  // =============================
  const address = await addressRepo.getAddressById(
    userId,
    addressId
  );

  if (!address) {
    const error = new Error("Invalid address");
    error.type = "CHECKOUT";
    throw error;
  }

  const addressSnapshot = {
    name: address.name,
    street: address.street,
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    phone: address.phone
  };

  // =============================
  // STOCK VALIDATION
  // =============================
  const orderItems = [];

  for (const item of checkoutData.items) {

    const normalizedType =
      normalizeVariantType(item.variantType);

    const product = await Product.findOne({
      _id: item.productId,
      variants: {
        $elemMatch: {
          type: normalizedType,
          stock: { $gte: item.quantity }
        }
      }
    });

    if (!product) {
      const error = new Error(
        `${item.title} stock changed, try again`
      );
      error.type = "CHECKOUT";
      throw error;
    }

    orderItems.push({
      productId: item.productId,
      title: item.title,
      author: item.author,
      variantType: item.variantType,
      quantity: item.quantity,
      price: item.price,
      itemTotal: item.itemTotal,
      image: item.images?.cover
    });
  }

  const orderId = orderRepo.generateOrderId();

  const isCod = paymentMethod === "cod";
  const isWallet = paymentMethod === "wallet";

  // =============================
  // CREATE ORDER FIRST
  // =============================
  const order = await orderRepo.createOrder({
    orderId,
    userId,
    items: orderItems,
    address: addressSnapshot,
    paymentMethod,

    paymentStatus:
      isWallet ? "paid" : "pending",

    orderStatus:
      (isCod || isWallet)
        ? "placed"
        : "pending",

    subtotal: checkoutData.subtotal,
    totalAmount: checkoutData.subtotal
  });

  // =============================
  // COD FLOW
  // =============================
  if (isCod) {
    await reduceStockService(orderItems);
    await orderRepo.markPlaced(orderId);
  }

  // =============================
  // WALLET FLOW
  // =============================
  if (isWallet) {

    await walletDebitPaymentService({
      userId,
      amount: order.totalAmount,
      referenceId: order.orderId
    });

    await reduceStockService(orderItems);
    await orderRepo.markPlaced(orderId);
  }

  // =============================
  // CLEAR CART
  // =============================
  await cartRepo.clearCart(userId);

  return order;
};


export const reduceStockService = async (items) => {
  for (const item of items) {

    const normalizedType = normalizeVariantType(item.variantType);

    await Product.updateOne(
      {
        _id: item.productId,
        variants: {
          $elemMatch: {
            type: normalizedType,
            stock: { $gte: item.quantity }
          }
        }
      },
      {
        $inc: {
          "variants.$.stock": -item.quantity
        }
      }
    );
  }
};

export const createRazorpayOrderService = async ({
  orderId,
  amount
}) => {
  const options = {
    amount: amount * 100,
    currency: "INR",
    receipt: orderId
  };

  const razorpayOrder = await razorpayInstance.orders.create(options);

  await orderRepo.updateRazorpayDetails({
    orderId,
    razorpayOrderId: razorpayOrder.id
  });

  return razorpayOrder;
};


export const verifyPaymentService = async ({
  userId,
  orderId,
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature
}) => {

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new Error("Invalid payment signature");
  }

  const order = await orderRepo.getOrderByOrderId(orderId, userId);

  await reduceStockService(order.items);

  await orderRepo.markOrderPaid({
    orderId,
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature
  });

  return true;
};

export const getOrderSuccessService = async (userId, orderId) => {

  if (!orderId) {
    const error = new Error("Invalid order");
    error.type = "ORDER";
    throw error;
  }

  const order = await orderRepo.getOrderByOrderId(orderId, userId);

  if (!order) {
    const error = new Error("Order not found");
    error.type = "ORDER";
    throw error;
  }

  return order;
};

export const getOrderFailedService = async (userId, orderId) => {

  if (!orderId) {
    const error = new Error("Invalid order");
    error.type = "ORDER";
    throw error;
  }

  const order = await orderRepo.getOrderByOrderId(orderId, userId);

  if (!order) {
    const error = new Error("Order not found");
    error.type = "ORDER";
    throw error;
  }

  if (order.paymentMethod !== "razorpay") {
    const error = new Error("Invalid payment order");
    error.type = "ORDER";
    throw error;
  }

  return order;
};


export const markPaymentFailedService = async (orderId) => {

  if (!orderId) {
    const error = new Error("Invalid order");
    error.type = "ORDER";
    throw error;
  }

  await orderRepo.markPaymentFailed(orderId);

  return true;
};

export const retryPaymentService = async ({
  userId,
  orderId
}) => {

  const order = await orderRepo.getRetryEligibleOrder(orderId, userId);

  if (!order) {
    const error = new Error("Order not eligible for retry");
    error.type = "ORDER";
    throw error;
  }

  let recalculatedTotal = 0;

  for (const item of order.items) {

    const product = await orderRepo.getProductForRetry(item.productId);

    if (!product) {
      throw new Error(`${item.title} no longer available`);
    }

    const unavailable =
      !product.isActive ||
      product.isDeleted ||
      !product.category?.isActive ||
      product.category?.isDeleted;

    if (unavailable) {
      throw new Error(`${item.title} is unavailable`);
    }

    const variant = product.variants.find(
      v => v.type.toLowerCase() === item.variantType.toLowerCase()
    );

    if (!variant) {
      throw new Error(`${item.title} variant unavailable`);
    }

    if (variant.stock < item.quantity) {
      throw new Error(
        `${item.title} only ${variant.stock} stock available`
      );
    }

    // Use current price
    const latestPrice = variant.salePrice || variant.regularPrice;

    recalculatedTotal += latestPrice * item.quantity;
  }

  // Optional: update order total if changed
  if (recalculatedTotal !== order.totalAmount) {
    await Order.updateOne(
      { orderId },
      {
        $set: {
          subtotal: recalculatedTotal,
          totalAmount: recalculatedTotal
        }
      }
    );
  }

  const options = {
    amount: recalculatedTotal * 100,
    currency: "INR",
    receipt: order.orderId
  };

  const razorpayOrder = await razorpayInstance.orders.create(options);

  await orderRepo.updateRazorpayDetails({
    orderId,
    razorpayOrderId: razorpayOrder.id
  });

  await orderRepo.updatePaymentStatus(orderId, "pending");

  return {
    orderId: order.orderId,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    key: process.env.RAZORPAY_KEY_ID
  };
};

export const getUserOrdersService = async (query, userId) => {

  const page = parseInt(query.page) || 1;
  const limit = 5;

  const search = query.search?.trim() || "";

  const sort = query.sort || "newest"; 
  // newest | oldest | price_low | price_high

  const status = query.status || "all"; 

  const data = await orderRepo.getUserOrders({
    userId,
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


export const getOrderDetailsService = async (userId, orderId) => {

  if (!orderId) {
    const error = new Error("Invalid order");
    error.type = "ORDER";
    throw error;
  }

  const order = await orderRepo.getOrderDetails(orderId, userId);

  if (!order) {
    const error = new Error("Order not found");
    error.type = "ORDER";
    throw error;
  }

  // =============================
  // ESTIMATED DELIVERY DATE
  // =============================
  const createdAt = new Date(order.createdAt);

  // simple logic: +5 days delivery
  const estimatedDeliveryDate = new Date(createdAt);
  estimatedDeliveryDate.setDate(createdAt.getDate() + 5);

  // delivered date (if delivered)
  const deliveredDate =
    order.orderStatus === "delivered"
      ? new Date(order.updatedAt)
      : null;

  // =============================
  // PROGRESS STEP
  // =============================
  const statusSteps = [
    "pending",
    "placed",
    "shipped",
    "out_for_delivery",
    "delivered"
  ];

  const currentStepIndex = statusSteps.indexOf(order.orderStatus);

  // =============================
  // ITEM FLAGS
  // =============================
  const items = order.items.map(item => {

    const canCancel =
      item.status === "pending" ||
      item.status === "placed" ;

    const canReturn =
      item.status === "delivered";

    return {
      ...item,
      canCancel,
      canReturn,
      isCancelled: item.status === "cancelled",
      isReturned: item.status === "returned"
    };
  });

  // =============================
  // ORDER LEVEL FLAGS
  // =============================
  const allItemsCancellable = items.every(i => i.canCancel);
  const allItemsReturnable = items.every(i => i.canReturn);

  const canCancelOrder =
    order.orderStatus !== "delivered" &&
    allItemsCancellable;

  const canReturnOrder =
    order.orderStatus === "delivered" &&
    allItemsReturnable;

  return {
    order: {
      ...order,
      items
    },

    meta: {
      estimatedDeliveryDate,
      deliveredDate,
      currentStepIndex,
      statusSteps,

      canCancelOrder,
      canReturnOrder
    }
  };
};


export const cancelOrderItemService = async (userId, orderId, itemId, reason) => {

  const order = await orderRepo.getOrderByOrderId(orderId, userId);

  if (!order) {
    const error = new Error("Order not found");
    error.type = "ORDER";
    throw error;
  }

  const item = order.items.id(itemId);

  if (!item) {
    const error = new Error("Item not found");
    error.type = "ORDER";
    throw error;
  }

  if (!['pending','placed'].includes(item.status)) {
    const error = new Error("Item cannot be cancelled");
    error.type = "ORDER";
    throw error;
  }

  const result = await orderRepo.requestCancelItem(orderId, itemId, reason);

  if(order.orderStatus !== 'pending' && order.paymentStatus !== 'failed'){
    await orderRepo.restoreStock([item]);
  }

  const refundable =
  ["paid", "partially_refunded"]
    .includes(order.paymentStatus);

const noCodRefund =
  order.paymentMethod === "cod";

if (refundable && !noCodRefund) {
  await walletRefundService({
    userId,
    amount: item.itemTotal,
    referenceId: orderId
  });
}

await orderRepo.syncPaymentRefundStatus(orderId);

  await orderRepo.syncOrderStatusWithItems(orderId);

  return true;
};


export const returnOrderItemService = async (userId, orderId, itemId, reason) => {

  if (!reason || !reason.trim()) {
    const error = new Error("Return reason is required");
    error.type = "VALIDATION";
    throw error;
  }

  const order = await orderRepo.getOrderByOrderId(orderId, userId);

  if (!order) {
    const error = new Error("Order not found");
    error.type = "ORDER";
    throw error;
  }

  const item = order.items.id(itemId);

  if (!item) {
    const error = new Error("Item not found");
    error.type = "ORDER";
    throw error;
  }

  if (item.status !== "delivered") {
    const error = new Error("Item cannot be returned");
    error.type = "ORDER";
    throw error;
  }

  await orderRepo.requestReturnItem(orderId, itemId, reason);

  await orderRepo.syncOrderStatusWithItems(orderId);

  return true;
};


export const cancelOrderService = async (
  userId,
  orderId,
  reason
) => {

  const order = await orderRepo.getOrderByOrderId(
    orderId,
    userId
  );

  if (!order) {
    const error = new Error("Order not found");
    error.type = "ORDER";
    throw error;
  }

  if (order.orderStatus === "delivered") {
    const error = new Error(
      "Delivered order cannot be cancelled"
    );
    error.type = "ORDER";
    throw error;
  }

  // =====================================
  // ITEMS ELIGIBLE FOR CANCEL
  // =====================================
  const restorableItems = order.items.filter(
    item =>
      !["cancelled", "returned"].includes(
        item.status
      )
  );

  if (!restorableItems.length) {
    const error = new Error(
      "No cancellable items found"
    );
    error.type = "ORDER";
    throw error;
  }

  // =====================================
  // RESTORE STOCK
  // only if stock was reduced earlier
  // =====================================
  if (
    order.orderStatus !== "pending" &&
    order.paymentStatus !== "failed"
  ) {
    await orderRepo.restoreStock(
      restorableItems
    );
  }

  // =====================================
  // CANCEL ORDER + ITEMS
  // =====================================
  await orderRepo.requestCancelOrder(
    orderId,
    userId,
    reason
  );

  // =====================================
  // REFUND TO WALLET
  // only if payment already received
  // =====================================
  const refundable =
    ["paid", "partially_refunded"].includes(
      order.paymentStatus
    );

  const noCodRefund =
    order.paymentMethod === "cod";

  if (refundable && !noCodRefund) {

    let refundAmount = 0;

    for (const item of restorableItems) {
      refundAmount += item.itemTotal;
    }

    if (refundAmount > 0) {
      await walletRefundService({
        userId,
        amount: refundAmount,
        referenceId: orderId
      });
    }
  }

  // =====================================
  // UPDATE PAYMENT STATUS
  // =====================================
  await orderRepo.syncPaymentRefundStatus(
    orderId
  );

  return true;
};


export const returnOrderService = async (userId, orderId, reason) => {

  if (!reason || !reason.trim()) {
    const error = new Error("Return reason is required");
    error.type = "VALIDATION";
    throw error;
  }

  const order = await orderRepo.getOrderByOrderId(orderId, userId);

  if (!order) {
    const error = new Error("Order not found");
    error.type = "ORDER";
    throw error;
  }

  if (order.orderStatus !== "delivered") {
    const error = new Error("Only delivered orders can be returned");
    error.type = "ORDER";
    throw error;
  }

  await orderRepo.requestReturnOrder(orderId, userId, reason);

  return true;
};



export const generateInvoiceService = async (userId, orderId) => {

  const order = await orderRepo.getOrderDetails(orderId, userId);

  if (!order) {
    const error = new Error("Order not found");
    error.type = "ORDER";
    throw error;
  }

  // =============================
  // Render HTML from EJS
  // =============================
  const templatePath = path.join(
    process.cwd(),
    "views/user/invoice.ejs"
  );

  const html = await ejs.renderFile(templatePath, { order });

  // =============================
  // Generate PDF
  // =============================
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new"
  });

  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: "domcontentloaded" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true
  });

  await browser.close();

  return pdfBuffer;
};