import Address from "../../models/user/address.schema.js";

export const createAddress = async (data) => {
  return await Address.create(data);
};

export const unsetDefaultAddress = async (userId) => {
  return await Address.updateMany(
    { userId },
    { isDefault: false }
  );
};

export const getUserAddresses = async (userId) => {
  return await Address.find({ userId }).sort({ createdAt: -1 });
};