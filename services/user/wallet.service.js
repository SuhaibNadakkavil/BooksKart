import crypto from "crypto";

import razorpayInstance from "../../config/razorpay.js";

import * as walletRepo from "../../repositories/user/wallet.repository.js";


// =====================================
// LOAD WALLET PAGE
// =====================================
export const loadWalletPageService = async ({
  userId,
  page = 1
}) => {

  const limit = 10;

  await walletRepo.getOrCreateWallet(userId);

  const data = await walletRepo.getWalletHistory({
    userId,
    page,
    limit
  });

  return {
    wallet: data.wallet,
    transactions: data.transactions,
    currentPage: data.currentPage,
    totalPages: data.totalPages
  };
};


// =====================================
// CREATE TOPUP ORDER (RAZORPAY)
// =====================================
export const createTopupOrderService = async ({
  userId,
  amount
}) => {

  const parsedAmount = Number(amount);

  if (!parsedAmount || parsedAmount < 1) {
    throw new Error("Invalid amount");
  }

  if (parsedAmount > 50000) {
    throw new Error("Maximum top-up limit is ₹50000");
  }

  await walletRepo.getOrCreateWallet(userId);

  const receipt = `WALLET-${userId}`;

  const razorpayOrder = await razorpayInstance.orders.create({
    amount: parsedAmount * 100,
    currency: "INR",
    receipt
  });

  return {
    key: process.env.RAZORPAY_KEY_ID,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    razorpayOrderId: razorpayOrder.id,
    walletAmount: parsedAmount
  };
};


// =====================================
// VERIFY TOPUP PAYMENT
// =====================================
export const verifyWalletTopupService = async ({
  userId,
  walletAmount,
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature
}) => {

  const amount = Number(walletAmount);

  if (!amount || amount < 1) {
    throw new Error("Invalid wallet amount");
    
  }

  const body =
    razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac(
      "sha256",
      process.env.RAZORPAY_KEY_SECRET
    )
    .update(body.toString())
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new Error("Payment verification failed");
  }

  await walletRepo.getOrCreateWallet(userId);

  const wallet = await walletRepo.creditWallet({
    userId,
    amount,
    source: "topup",
    description: "Wallet top-up via Razorpay",
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id
  });

  return wallet;
};


// =====================================
// PAY USING WALLET (FOR CHECKOUT)
// =====================================
export const walletDebitPaymentService = async ({
  userId,
  amount,
  referenceId
}) => {

  const parsedAmount = Number(amount);

  if (!parsedAmount || parsedAmount < 1) {
    throw new Error("Invalid debit amount");
  }

  await walletRepo.getOrCreateWallet(userId);

  const wallet = await walletRepo.debitWallet({
    userId,
    amount: parsedAmount,
    source: "purchase",
    description: "Order payment using wallet",
    referenceId
  });

  if (!wallet) {
    throw new Error("Insufficient wallet balance");
  }

  return wallet;
};


// =====================================
// REFUND TO WALLET (FOR RETURNS LATER)
// =====================================
export const walletRefundService = async ({
  userId,
  amount,
  referenceId
}) => {

  const parsedAmount = Number(amount);

  if (!parsedAmount || parsedAmount < 1) {
    throw new Error("Invalid refund amount");
  }

  await walletRepo.getOrCreateWallet(userId);

  const wallet = await walletRepo.creditWallet({
    userId,
    amount: parsedAmount,
    source: "refund",
    description: "Order refund credited to wallet",
    referenceId
  });

  return wallet;
};