import User from "../../models/user/userSchema.js";

// =====================================
// FIND USER BY REFERRAL CODE
// =====================================
export const getUserByReferralCode = async (
  referralCode
) => {
  return await User.findOne({
    referralCode:
      referralCode.toUpperCase().trim()
  });
};


// =====================================
// CHECK CODE EXISTS
// =====================================
export const isReferralCodeExists = async (
  referralCode
) => {
  const user = await User.findOne({
    referralCode
  }).select("_id");

  return !!user;
};


// =====================================
// SAVE REFERRED BY
// =====================================
export const setReferredBy = async ({
  userId,
  referrerId
}) => {
  return await User.updateOne(
    { _id: userId },
    {
      $set: {
        referredBy: referrerId
      }
    }
  );
};


// =====================================
// MARK REWARD PROCESSED
// =====================================
export const markReferralRewarded =
async (userId) => {
  return await User.updateOne(
    { _id: userId },
    {
      $set: {
        isReferralRewarded: true
      }
    }
  );
};


// =====================================
// GET USER REFERRAL INFO
// =====================================
export const getReferralUserData =
async (userId) => {
  return await User.findById(userId)
    .select(
      "name referralCode referredBy isReferralRewarded"
    )
    .lean();
};


// =====================================
// NETWORK SIZE
// =====================================
export const getReferralCount =
async (userId) => {
  return await User.countDocuments({
    referredBy: userId
  });
};


export const markReferralStepCompleted =
async (userId) => {
  return await User.updateOne(
    { _id: userId },
    {
      $set: {
        isReferralStepCompleted: true
      }
    }
  );
};