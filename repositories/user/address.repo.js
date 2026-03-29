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
  return await Address.find({ 
    userId, 
    isDeleted: false
  }).sort({ createdAt: -1 });
};

export const getAddressById = async (userId, addressId) => {
  return await Address.findOne({
    _id: addressId,
    userId: userId,
    isDeleted: false
  });
};

export const updateAddress = async (id, data) => {
  return await Address.findByIdAndUpdate(id, data, { new: true });
};

export const softDeleteAddress = async (id) => {
  return await Address.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
};