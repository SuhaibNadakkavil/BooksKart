import User from "../models/user.js";

//find user

export const findById = async (userId) => {
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