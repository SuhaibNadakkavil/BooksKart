import redisClient from "../../config/redis.js";
import { sendMail } from "../common/mail.service.js";
import { generateOTP } from "../../utils/otp.js";

export const storeSignupOTP = async (email, data, ttl = 300) => {
  const key = `otp:signup:${email}`;

  await redisClient.set(
    key,
    JSON.stringify(data),
    { EX: ttl }
  );
};

export const getSignupOTP = async (email) => {
  const key = `otp:signup:${email}`;
  const data = await redisClient.get(key);
  return data ? JSON.parse(data) : null;
};

export const deleteSignupOTP = async (email) => {
  const key = `otp:signup:${email}`;
  await redisClient.del(key);
};

export const sendSignupOTPEmail = async (email, otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color:#121212;">Verify Your Email</h2>
      <p>Use the OTP below to verify your BooksKart account:</p>
      <div style="
        font-size: 24px;
        font-weight: bold;
        letter-spacing: 4px;
        margin: 20px 0;
        color: #121212;
      ">
        ${otp}
      </div>
      <p>This OTP will expire in 5 minutes.</p>
    </div>
  `;

  await sendMail({
    to: email,
    subject: "BooksKart Email Verification OTP",
    html,
  });
};

export const resendSignupOTPService = async (email) => {
  const storedData = await getSignupOTP(email);

  if (!storedData) {
    const error = new Error("OTP expired. Please signup again.");
    error.type = "GLOBAL";
    throw error;
  }

  const newOtp = generateOTP(6);

  await storeSignupOTP(email, {
    otp: newOtp,
    userData: storedData.userData,
  });

  await sendSignupOTPEmail(email, newOtp);

  return true;
};


// Forgot Password OTP

export const storeResetOTP = async (email, data) => {
  await redisClient.set(
    `reset:${email}`,
    JSON.stringify(data),
    { EX: 300 } // 5 minutes
  );
};

export const getResetOTP = async (email) => {
  const data = await redisClient.get(`reset:${email}`);
  return data ? JSON.parse(data) : null;
};

export const deleteResetOTP = async (email) => {
  await redisClient.del(`reset:${email}`);
};

export const resendResetOTPService = async (email) => {

  const storedData = await getResetOTP(email);

  if (!storedData) {
    const error = new Error("OTP expired. Please try again.");
    error.type = "GLOBAL";
    throw error;
  }

  const newOtp = generateOTP(6);

  await storeResetOTP(email, { otp: newOtp });

  await sendSignupOTPEmail(email, newOtp);

  return true;
};