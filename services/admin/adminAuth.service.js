import bcrypt from "bcrypt";
import * as userRepo from '../../repositories/user/user.repository.js'
import HTTP_STATUS from "../../utils/httpStatus.js";

export const adminLoginService = async ({ email, password }) => {

  email = email.toLowerCase().trim();

  const user = await userRepo.findByEmail(email, true);

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = HTTP_STATUS.UNAUTHORIZED;
    error.type = "FIELD";
    error.field = "general";
    throw error;
  }

  // IMPORTANT: Role check
  if (user.role !== "admin") {
    const error = new Error("Unauthorized admin access");
    error.statusCode = HTTP_STATUS.FORBIDDEN;
    error.type = "FIELD";
    error.field = "general";
    throw error;
  }

  if (user.isBlocked) {
    const error = new Error("Admin account blocked");
    error.statusCode = HTTP_STATUS.FORBIDDEN;
    error.type = "FIELD";
    error.field = "general";
    throw error;
  }

  if (!user.password) {
    const error = new Error("Invalid authentication method");
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
    error.type = "FIELD";
    error.field = "general";
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