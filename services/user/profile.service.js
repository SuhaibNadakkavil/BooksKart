import * as userRepo from "../../repositories/user/user.repository.js";
import HTTP_STATUS from "../../utils/httpStatus.js";
import bcrypt from "bcrypt"
import { generateOTP } from "../../utils/otp.js";
import { sendSignupOTPEmail, storeChangeEmailOTP } from "./otp.service.js";
import { deleteCloudinaryImage } from "../../utils/cloudinary.util.js";

export const profileService = async (user) => {
  return user;
};

export const updateProfileService = async (userId, data) => {

  const existingUser = await userRepo.findById(userId);

  if (!existingUser) {
    const error = new Error("User not found");
    error.type = "GLOBAL";
    error.statusCode = HTTP_STATUS.NOT_FOUND;
    throw error;
  }

  // If phone changed → check uniqueness
  if (data.phone && data.phone !== existingUser.phone) {
    const phoneExists = await userRepo.findByPhone(data.phone);
    if (phoneExists) {
      const error = new Error("Phone number already in use");
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
      error.type = "FIELD";
      error.field = "phone";
      throw error;
    }
  }

  if (data.profileImage && existingUser.profileImage) {
    await deleteCloudinaryImage(existingUser.profileImage);
  }

  const updatedUser = await userRepo.updateUser(userId, data);

  return updatedUser;
};


export const changePasswordService = async (
  userId,
  currentPassword,
  newPassword
) => {

  const user = await userRepo.findById(userId, true);

  if (!user) {
    const error = new Error("User not found");
    error.type = "GLOBAL";
    error.statusCode = HTTP_STATUS.NOT_FOUND;
    throw error;
  }

  if (!user.password) {
    const error = new Error("Password not set for this account");
    error.type = "GLOBAL";
    throw error;
  }

  // Compare current password
  const isMatch = await bcrypt.compare(
    currentPassword,
    user.password
  );

  if (!isMatch) {
    const error = new Error("Current password is incorrect");
    error.type = "FIELD";
    error.field = "currentPassword";
    throw error;
  }

  // Prevent reusing same password
  const isSamePassword = await bcrypt.compare(
    newPassword,
    user.password
  );

  if (isSamePassword) {
    const error = new Error("New password must be different");
    error.type = "FIELD";
    error.field = "newPassword";
    throw error;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await userRepo.updateUser(userId, {
    password: hashedPassword,
  });

  return true;
};


export const changeEmailService = async (userId, newEmail) => {

  newEmail = newEmail.toLowerCase().trim();

  const existingUser = await userRepo.findByEmail(newEmail);

  if (existingUser) {
    const error = new Error("Email already in use");
    error.type = "FIELD";
    error.field = "newEmail";
    throw error;
  }

  const otp = generateOTP(6);

  await storeChangeEmailOTP(newEmail, {
    otp,
    userId
  });

  await sendSignupOTPEmail(newEmail, otp);

  return true;
};