import {
  createCouponService,
  getCouponsService,
  updateCouponService,
  toggleCouponStatusService,
  deleteCouponService
} from "../../services/admin/coupon.service.js";

import { couponSchema } from "../../validators/admin/coupon.validator.js";

import HTTP_STATUS from "../../utils/httpStatus.js";


// =====================================
// LOAD COUPON PAGE
// =====================================
export const loadCouponsPage = async (
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

    const data =
      await getCouponsService(req.query);

    res.status(HTTP_STATUS.OK).render(
      "admin/coupons",
      {
        title:
          "Coupon Management | BooksKart",
        activePage: 'coupons',
        coupons: data.coupons,
        totalPages: data.totalPages,
        page: data.currentPage,
        query: req.query,
        success,
        error,
        pageScript:
          "/js/adminCoupons.js"
      }
    );
  } catch (err) {
    next(err);
  }
};


// =====================================
// CREATE
// =====================================
export const createCoupon = async (
  req,
  res,
  next
) => {
  try {
    const { error, value } =
      couponSchema.validate(req.body);

    if (error) {
      return res.status(
        HTTP_STATUS.BAD_REQUEST
      ).json({
        success: false,
        message:
          error.details[0].message
      });
    }

    await createCouponService(value);

    return res.json({
      success: true,
      message:
        "Coupon created successfully"
    });
  } catch (err) {
    if(err.type = "VALIDATION"){
        return res.status(
        HTTP_STATUS.BAD_REQUEST
        ).json({
        success: false,
        message: err.message
        });
    }
    next(err)
}
};


// =====================================
// UPDATE
// =====================================
export const updateCoupon = async (
  req,
  res,
  next
) => {
  try {
    const { couponId } = req.params;

    const { error, value } =
      couponSchema.validate(req.body);

    if (error) {
      return res.status(
        HTTP_STATUS.BAD_REQUEST
      ).json({
        success: false,
        message:
          error.details[0].message
      });
    }

    await updateCouponService(
      couponId,
      value
    );

    return res.json({
      success: true,
      message:
        "Coupon updated successfully"
    });
  } catch (err) {
    return res.status(
      HTTP_STATUS.BAD_REQUEST
    ).json({
      success: false,
      message: err.message
    });
  }
};


// =====================================
// TOGGLE
// =====================================
export const toggleCouponStatus =
async (req, res, next) => {
  try {
    const { couponId } = req.params;

    await toggleCouponStatusService(
      couponId
    );

    return res.json({
      success: true
    });
  } catch (err) {
    return res.status(
      HTTP_STATUS.BAD_REQUEST
    ).json({
      success: false,
      message: err.message
    });
  }
};


// =====================================
// DELETE
// =====================================
export const deleteCoupon = async (
  req,
  res,
  next
) => {
  try {
    const { couponId } = req.params;

    await deleteCouponService(
      couponId
    );

    return res.json({
      success: true,
      message:
        "Coupon deleted successfully"
    });
  } catch (err) {
    return res.status(
      HTTP_STATUS.BAD_REQUEST
    ).json({
      success: false,
      message: err.message
    });
  }
};