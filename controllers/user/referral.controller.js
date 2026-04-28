import HTTP_STATUS from "../../utils/httpStatus.js";

import {
  getReferralPageService
} from "../../services/user/referral.service.js";


// =====================================
// LOAD REFERRAL PAGE
// =====================================
export const loadReferralPage = async (
  req,
  res,
  next
) => {
  try {

    const success =
      req.session.success || null;

    const error =
      req.session.error || null;

    delete req.session.success;
    delete req.session.error;

    const userId = req.user._id;

    const data =
      await getReferralPageService(
        userId
      );

    return res
      .status(HTTP_STATUS.OK)
      .render("user/referral", {
        title:
          "Refer & Earn | BooksKart",

        headerType: "main",

        activePage: "refer",

        success,
        error,

        referralCode:
          data.referralCode,

        networkSize:
          data.networkSize,

        totalRewards:
          data.totalRewards,

        referralBonus: 100,

        pageScript:
          "/js/referral.js"
      });

  } catch (err) {
    next(err);
  }
};