import * as referralRepo from "../../repositories/user/referral.repository.js";
import * as walletRepo from "../../repositories/user/wallet.repository.js";
import * as userRepo from "../../repositories/user/user.repository.js"

const REFERRAL_BONUS = 100;


// =====================================
// GENERATE UNIQUE CODE
// =====================================
export const generateReferralCode =
async (name = "USER") => {

  const base = name
    .replace(/\s+/g, "")
    .slice(0, 5)
    .toUpperCase();

  let code = "";

  let exists = true;

  while (exists) {

    code =
      base +
      Math.floor(
        1000 + Math.random() * 9000
      );

    exists =
      await referralRepo.isReferralCodeExists(
        code
      );
  }

  return code;
};


// =====================================
// VALIDATE REFERRAL CODE
// =====================================
export const validateReferralCodeService =
async (code, currentUserId = null) => {

  if (!code) return null;

  const referrer =
    await referralRepo.getUserByReferralCode(
      code
    );

  if (!referrer) {
    throw new Error(
      "Invalid referral code"
    );
  }

  if (
    currentUserId &&
    referrer._id.toString() ===
      currentUserId.toString()
  ) {
    throw new Error(
      "You cannot use your own code"
    );
  }

  return referrer;
};


// =====================================
// REWARD BOTH USERS
// Trigger after first successful order
// =====================================
export const processReferralRewardService =
async (userId) => {

    const user =
    await referralRepo.getReferralUserData(
      userId
    );

  if (!user) return false;

  if (
    !user.referredBy ||
    user.isReferralRewarded
  ) {
    return false;
  }

  await walletRepo.getOrCreateWallet(
    user._id
  );

  await walletRepo.getOrCreateWallet(
    user.referredBy
  );

  // New user reward
  await walletRepo.creditWallet({
    userId: user._id,
    amount: REFERRAL_BONUS,
    source: "referral",
    description:
      "Welcome bonus via referral"
  });

  // Referrer reward
  await walletRepo.creditWallet({
    userId: user.referredBy,
    amount: REFERRAL_BONUS,
    source: "referral",
    description:
      "Referral reward credited"
  });

  await referralRepo.markReferralRewarded(
    user._id
  );

  return true;
};


// =====================================
// LOAD REFERRAL PAGE
// =====================================
export const getReferralPageService =
async (userId) => {

  const user =
    await referralRepo.getReferralUserData(
      userId
    );

  const networkSize =
    await referralRepo.getReferralCount(
      userId
    );

  const totalRewards =
    networkSize *
    REFERRAL_BONUS;

  if (!user.referralCode) {
   const code = await generateReferralCode(user.name);

   await userRepo.updateUser(userId, {
      referralCode: code
   });

   user.referralCode = code;
}

  return {
    referralCode:
      user.referralCode,
    networkSize,
    totalRewards
  };
};