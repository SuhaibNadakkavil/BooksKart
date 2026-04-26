import Wallet from "../../models/user/wallet.schema.js";

// ==============================
// FIND WALLET
// ==============================
export const getWalletByUserId = async (userId) => {
  return await Wallet.findOne({ userId });
};

// ==============================
// CREATE WALLET
// ==============================
export const createWallet = async (userId) => {
  return await Wallet.create({
    userId,
    balance: 0,
    totalCredited: 0,
    totalDebited: 0,
    transactions: []
  });
};

// ==============================
// GET OR CREATE
// ==============================
export const getOrCreateWallet = async (userId) => {
  let wallet = await Wallet.findOne({ userId });

  if (!wallet) {
    wallet = await createWallet(userId);
  }

  return wallet;
};

// ==============================
// CREDIT MONEY
// ==============================
export const creditWallet = async ({
  userId,
  amount,
  source,
  description = "",
  referenceId = null,
  razorpayOrderId = null,
  razorpayPaymentId = null
}) => {

  return await Wallet.findOneAndUpdate(
    { userId },
    {
      $inc: {
        balance: amount,
        totalCredited: amount
      },

      $push: {
        transactions: {
          type: "credit",
          source,
          amount,
          description,
          status: "success",
          referenceId,
          razorpayOrderId,
          razorpayPaymentId
        }
      }
    },
    { new: true }
  );
};

// ==============================
// DEBIT MONEY
// ==============================
export const debitWallet = async ({
  userId,
  amount,
  source,
  description = "",
  referenceId = null
}) => {

  return await Wallet.findOneAndUpdate(
    {
      userId,
      balance: { $gte: amount }
    },
    {
      $inc: {
        balance: -amount,
        totalDebited: amount
      },

      $push: {
        transactions: {
          type: "debit",
          source,
          amount,
          description,
          status: "success",
          referenceId
        }
      }
    },
    { new: true }
  );
};

// ==============================
// WALLET SUMMARY + PAGINATED TXNS
// ==============================
export const getWalletHistory = async ({
  userId,
  page = 1,
  limit = 10
}) => {

  const wallet = await Wallet.findOne({ userId }).lean();

  if (!wallet) {
    return {
      wallet: null,
      transactions: [],
      totalPages: 0,
      currentPage: page
    };
  }

  const sorted = [...wallet.transactions].reverse();

  const start = (page - 1) * limit;
  const end = start + limit;

  const transactions = sorted.slice(start, end);

  return {
    wallet,
    transactions,
    totalPages: Math.ceil(sorted.length / limit),
    currentPage: page
  };
};