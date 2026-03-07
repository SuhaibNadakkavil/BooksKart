import User from "../../models/user/userSchema.js";

//find user

export const findById = async (userId, includePassword = false) => {

  if (includePassword) {
    return await User.findById(userId).select("+password");
  }

  return await User.findById(userId);
};

export const findByEmail = async (email, includePassword = false) => {
    if (includePassword) {
        return await User.findOne({email}).select("+password")
    }
    return await User.findOne({email})
}

export const findByPhone = async (phone) => {
  return await User.findOne({ phone });
};

//create user

export const createUser = async (userData) => {
    return await User.create(userData)
}

//update user by id

export const updateUser = async (userId, updateData) => {
    return await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
    })
}

export const findUsers = async ({ skip, limit, filter, sort }) => {

  return User.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .select("name email phone isBlocked createdAt");

};

export const countUsers = async (filter) => {

  return User.countDocuments(filter);

};

export const updateUserBlockStatus = async (userId, isBlocked) => {

  return User.findByIdAndUpdate(
    userId,
    { isBlocked },
    { new: true }
  );

};