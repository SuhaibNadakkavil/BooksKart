import * as couponRepo from "../../repositories/user/coupon.repository.js";


// =====================================
// HELPERS
// =====================================
const normalizeCode = (code) =>
  code?.toUpperCase().trim();

const throwValidation = (message) => {
  const error = new Error(message);
  error.type = "VALIDATION";
  throw error;
};


// =====================================
// CREATE COUPON
// =====================================
export const createCouponService = async (payload) => {
  const {
    name,
    code,
    discountPercent,
    minCartValue,
    maxDiscountAmount,
    maxUsageCount,
    expiryDate
  } = payload;

  const couponCode = normalizeCode(code);

  const exists = await couponRepo.getCouponByCode(
    couponCode
  );

  if (exists) {
    throwValidation("Coupon code already exists");
  }

  const expiry = new Date(expiryDate);

  if (expiry <= new Date()) {
    throwValidation("Expiry date must be future");
  }

  return await couponRepo.createCoupon({
    name: name.trim(),
    code: couponCode,
    discountPercent: Number(discountPercent),
    minCartValue: Number(minCartValue || 0),
    maxDiscountAmount: maxDiscountAmount === "" ? 0 : Number(maxDiscountAmount),
    maxUsageCount: maxUsageCount === "" ? 0 : Number(maxUsageCount),
    expiryDate: expiry
    });
};


// =====================================
// GET COUPON LIST
// =====================================
export const getCouponsService = async (query) => {
  const page = Number(query.page) || 1;
  const limit = 10;
  const search = query.search?.trim() || "";

  return await couponRepo.getCoupons({
    page,
    limit,
    search
  });
};


// =====================================
// UPDATE COUPON
// =====================================
export const updateCouponService = async (
  couponId,
  payload
) => {
  const coupon =
    await couponRepo.getCouponById(couponId);

  if (!coupon) {
    throwValidation("Coupon not found");
  }

  const expiry = new Date(payload.expiryDate);

  if (expiry <= new Date()) {
    throwValidation("Expiry date must be future");
  }

  const nextCode = normalizeCode(payload.code);

  if (nextCode !== coupon.code) {
    const exists =
      await couponRepo.getCouponByCode(nextCode);

    if (exists) {
      throwValidation(
        "Coupon code already exists"
      );
    }
  }

  return await couponRepo.updateCoupon(
    couponId,
    {
      name: payload.name.trim(),
      code: nextCode,
      discountPercent: Number(
        payload.discountPercent
      ),
      minCartValue: Number(
        payload.minCartValue || 0
      ),

      maxDiscountAmount:
        payload.maxDiscountAmount === 0
          ? 0
          : Number(payload.maxDiscountAmount),

      maxUsageCount:
        payload.maxUsageCount === 0
          ? 0
          : Number(payload.maxUsageCount),

      expiryDate: expiry
    }
  );
};


// =====================================
// TOGGLE STATUS
// =====================================
export const toggleCouponStatusService =
async (couponId) => {
  const coupon =
    await couponRepo.getCouponById(couponId);

  if (!coupon) {
    throwValidation("Coupon not found");
  }

  return await couponRepo.toggleCouponStatus(
    couponId,
    !coupon.isActive
  );
};


// =====================================
// DELETE COUPON
// =====================================
export const deleteCouponService = async (
  couponId
) => {
  const coupon =
    await couponRepo.getCouponById(couponId);

  if (!coupon) {
    throwValidation("Coupon not found");
  }

  return await couponRepo.deleteCoupon(
    couponId
  );
};


// =====================================
// APPLY COUPON (CHECKOUT)
// =====================================
export const applyCouponService = async ({
  code,
  subtotal
}) => {
  const coupon =
    await couponRepo.getValidCouponByCode(code);

  if (!coupon) {
    throwValidation("Invalid coupon");
  }

  if (
    coupon.maxUsageCount > 0 &&
    coupon.usedCount >=
      coupon.maxUsageCount
  ) {
    throwValidation(
      "Coupon usage limit reached"
    );
  }

  if (subtotal < coupon.minCartValue) {
    throwValidation(
      `Minimum cart value ₹${coupon.minCartValue}`
    );
  }

  let discount =
    (subtotal *
      coupon.discountPercent) /
    100;

  discount = Math.round(discount);

  if (
    coupon.maxDiscountAmount > 0 &&
    discount >
      coupon.maxDiscountAmount
  ) {
    discount =
      coupon.maxDiscountAmount;
  }

  const finalTotal =
    subtotal - discount;

  return {
    couponId: coupon._id,
    code: coupon.code,
    discount,
    finalTotal
  };
};


// =====================================
// MARK USED AFTER SUCCESS ORDER
// =====================================
export const markCouponUsedService =
async (couponId) => {
  if (!couponId) return;

  await couponRepo.incrementCouponUsage(
    couponId
  );
};