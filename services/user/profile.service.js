import * as userRepo from "../../repositories/user/user.repository.js";
import HTTP_STATUS from "../../utils/httpStatus.js";

export const profileService = async (user) => {
  return user;
};

export const updateProfileService = async (userId, data) => {

  const existingUser = await userRepo.findById(userId);

  if (!existingUser) {
    req.session.destroy();
    return res.redirect('/login');
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

  const updatedUser = await userRepo.updateUser(userId, data);

  return updatedUser;
};