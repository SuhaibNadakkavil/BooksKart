import HTTP_STATUS from "../../utils/httpStatus.js";

import {
  loadWalletPageService,
  createTopupOrderService,
  verifyWalletTopupService
} from "../../services/user/wallet.service.js";


// =====================================
// LOAD WALLET PAGE
// =====================================
export const loadWalletPage = async (req, res, next) => {
  try {

    const success = req.session.success || null;
    const error = req.session.error || null;

    delete req.session.success;
    delete req.session.error;

    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;

    const data = await loadWalletPageService({
      userId,
      page
    });

    return res.status(HTTP_STATUS.OK).render("user/wallet", {
      title: "My Wallet | BooksKart",
      headerType: "main",
      activePage: 'wallet',

      wallet: data.wallet,
      transactions: data.transactions,

      currentPage: data.currentPage,
      totalPages: data.totalPages,

      success,
      error,

      pageScript: "/js/wallet.js"
    });

  } catch (err) {
    next(err);
  }
};


// =====================================
// CREATE TOPUP ORDER
// =====================================
export const createWalletTopupOrder = async (
  req,
  res,
  next
) => {
  try {

    const userId = req.user._id;
    const { amount } = req.body;

    const data = await createTopupOrderService({
      userId,
      amount
    });

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      ...data
    });

  } catch (err) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: err.message
    });
  }
};


// =====================================
// VERIFY TOPUP PAYMENT
// =====================================
export const verifyWalletTopup = async (
  req,
  res,
  next
) => {
  try {

    const userId = req.user._id;

    const {
      walletAmount,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    await verifyWalletTopupService({
      userId,
      walletAmount,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    });

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Money added to wallet"
    });

  } catch (err) {

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: err.message
    });
  }
};