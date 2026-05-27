import bcrypt from 'bcrypt'
import * as userRepo from '../../repositories/user/user.repository.js'
import HTTP_STATUS from '../../utils/httpStatus.js'
import { generateOTP } from '../../utils/otp.js'
import { 
  sendSignupOTPEmail, 
  storeSignupOTP, 
  storeResetOTP, 
  getResetOTP, 
  deleteResetOTP 
} from './otp.service.js'

import {
  generateReferralCode,
  validateReferralCodeService
} from "./referral.service.js";

//signup service
export const signupService = async ({
  name,
  email,
  phone,
  password,
  referralCode,
}) => {

  email = email.toLowerCase().trim();
  phone = phone.trim();

  const existingUser = await userRepo.findByEmail(email);
  if (existingUser) {
    const error = new Error("Email already registered");
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
    error.type = "FIELD";
    error.field = "email";
    throw error;
  }

  const existingPhone = await userRepo.findByPhone(phone);
  if (existingPhone) {
    const error = new Error("Phone number already registered");
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
    error.type = "FIELD";
    error.field = "phone";
    throw error;
  }

  let referrer = null;

  // =====================================
  // VALIDATE REFERRAL CODE
  // =====================================
  if (referralCode?.trim()) {
    try {
      referrer =
        await validateReferralCodeService(
          referralCode.trim()
        );
    } catch (err) {
      const error = new Error(
        err.message
      );

      error.type = "FIELD";
      error.field = "referralCode";

      throw error;
    }
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const ownReferralCode =
    await generateReferralCode(name);

    const otp = generateOTP(6)

    const userData = ({
      name: name.trim(),
      email,
      phone,
      password: hashedPassword,
      // user own code
      referralCode:
        ownReferralCode,
      
      isReferralStepCompleted: true,

      // who referred him
      referredBy:
        referrer?._id || null,
    });

    await storeSignupOTP(email, {
      otp,
      userData,
    })

    await sendSignupOTPEmail(email, otp)

    return { email };

  } catch (err) {
    const error = new Error("Something went wrong. Please try again.");
    error.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    error.type = "GLOBAL";
    throw error;
  }
};

export const googleAuthService = async (profile) => {

  const email = profile.emails?.[0]?.value?.toLowerCase();

  if (!email) {
    const error = new Error("Google email not found");
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
    throw error;
  }

  let user = await userRepo.findByEmail(email);

  // If user exists
  if (user) {

    if (user.isBlocked) {
      const error = new Error("Your account has been blocked");
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      throw error;
    }

    // Update googleId if not present
    if (!user.googleId) {
      user.googleId = profile.id;
      user.authProvider = "google";
      user.isVerified = true;
      await user.save();
    }

    return {
      user,
      isNewUser: false,
    };
  }

  const ownReferralCode =
    await generateReferralCode(
      profile.displayName
    );

  // If user does not exist → create
  const newUser =
    await userRepo.createUser({
      name: profile.displayName,
      email,
      password: null,
      phone: null,
      googleId: profile.id,
      authProvider: "google",
      isVerified: true,

      referralCode: ownReferralCode,

      isReferralStepCompleted: false,
    });

  return {
    user: newUser,
    isNewUser: true,
  };
};

//login service
export const loginService = async ({ email, password }) => {

  email = email.toLowerCase().trim();

  const user = await userRepo.findByEmail(email, true);

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = HTTP_STATUS.UNAUTHORIZED;
    error.type = "GLOBAL";
    throw error;
  }

  if (user.isBlocked) {
    const error = new Error("Your account has been blocked");
    error.statusCode = HTTP_STATUS.FORBIDDEN;
    error.type = "GLOBAL";
    throw error;
  }

  if (!user.password) {
    const error = new Error("Please login using Google");
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
    error.type = "GLOBAL";
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const error = new Error("Invalid password");
    error.statusCode = HTTP_STATUS.UNAUTHORIZED;
    error.type = "FIELD";
    error.field = "password";
    throw error;
  }

  return user;
};

export const forgotPasswordService = async (email) => {

  email = email.toLowerCase().trim();

  const user = await userRepo.findByEmail(email);

  // 🔐 SECURITY: do NOT reveal if user exists
  if (!user) {
    return;
  }

  if (user.authProvider === "google" && !user.password) {
    return;
  }

  const otp = generateOTP(6);

  await storeResetOTP(email, { otp });

  await sendSignupOTPEmail(email, otp);

  return { email }
};

export const verifyResetOTPService = async (email, otp) => {

  email = email.toLowerCase().trim();

  const storedData = await getResetOTP(email);

  if (!storedData) {
    const error = new Error("OTP expired. Please try again.");
    error.type = "GLOBAL";
    throw error;
  }

  if (storedData.otp !== otp) {
    const error = new Error("Invalid OTP");
    error.type = "GLOBAL";
    throw error;
  }

  return true;
};

export const setNewPasswordService = async (email, password) => {

  email = email.toLowerCase().trim();

  const user = await userRepo.findByEmail(email);

  if (!user) {
    const error = new Error("Invalid request");
    error.type = "GLOBAL";
    throw error;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Update user
  await userRepo.updateUser(user._id, {
    password: hashedPassword,
    authProvider: "local" // if previously google-only
  });

  // Delete reset OTP
  await deleteResetOTP(email);

  return true;
};