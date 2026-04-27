import Coupon from "../../models/user/coupon.schema.js";


// ==============================
// CREATE COUPON
// ==============================
export const createCoupon = async (data) => {
  return await Coupon.create(data);
};


// ==============================
// FIND BY CODE
// ==============================
export const getCouponByCode = async (code) => {
  return await Coupon.findOne({
    code: code.toUpperCase().trim(),
    isDeleted: false
  });
};


// ==============================
// FIND BY ID
// ==============================
export const getCouponById = async (couponId) => {
  return await Coupon.findOne({
    _id: couponId,
    isDeleted: false
  });
};


// ==============================
// ADMIN LISTING
// ==============================
export const getCoupons = async ({
  page = 1,
  limit = 10,
  search = ""
}) => {
  const skip = (page - 1) * limit;

  const query = {
    isDeleted: false
  };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { code: { $regex: search, $options: "i" } }
    ];
  }

  const [coupons, totalCount] = await Promise.all([
    Coupon.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Coupon.countDocuments(query)
  ]);

  return {
    coupons,
    totalCount,
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit)
  };
};


// ==============================
// UPDATE COUPON
// ==============================
export const updateCoupon = async (couponId, data) => {
  return await Coupon.findOneAndUpdate(
    {
      _id: couponId,
      isDeleted: false
    },
    {
      $set: data
    },
    {
      new: true
    }
  );
};


// ==============================
// TOGGLE STATUS
// ==============================
export const toggleCouponStatus = async (
  couponId,
  isActive
) => {
  return await Coupon.findOneAndUpdate(
    {
      _id: couponId,
      isDeleted: false
    },
    {
      $set: { isActive }
    },
    { new: true }
  );
};


// ==============================
// SOFT DELETE
// ==============================
export const deleteCoupon = async (couponId) => {
  return await Coupon.findOneAndUpdate(
    {
      _id: couponId
    },
    {
      $set: {
        isDeleted: true,
        isActive: false
      }
    },
    { new: true }
  );
};


// ==============================
// APPLY COUPON VALIDATION
// ==============================
export const getValidCouponByCode = async (code) => {
  return await Coupon.findOne({
    code: code.toUpperCase().trim(),
    isDeleted: false,
    isActive: true,
    expiryDate: { $gte: new Date() }
  });
};


// ==============================
// INCREMENT USED COUNT
// ==============================
export const incrementCouponUsage = async (
  couponId
) => {
  return await Coupon.updateOne(
    {
      _id: couponId
    },
    {
      $inc: { usedCount: 1 }
    }
  );
};