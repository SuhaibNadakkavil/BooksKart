import * as addressRepo from "../../repositories/user/address.repo.js";

export const addAddressService = async (userId, data) => {


  const existingAddresses = await addressRepo.getUserAddresses(userId);
 
  const newAddress = `${data.street}-${data.city}-${data.state}-${data.pincode}`
    .toLowerCase()
    .replace(/\s+/g, "");

  for (const address of existingAddresses) {

    const existing = `${address.street}-${address.city}-${address.state}-${address.pincode}`
      .toLowerCase()
      .replace(/\s+/g, "");

    if (existing === newAddress) {
      const error = new Error("This address already exists");
      error.type = "GLOBAL";
      throw error;
    }
  }

  if (existingAddresses.length >= 10) {
    const error = new Error("Maximum address limit reached");
    error.type = "GLOBAL";
    throw error;
  }

  if (existingAddresses.length === 0) {
    data.isDefault = true;
  }

  if (data.isDefault) {
    await addressRepo.unsetDefaultAddress(userId);
  }

  const createdAddress = await addressRepo.createAddress({
    userId,
    ...data
  });

  return createdAddress;
};

export const getUserAddressesService = async (userId) => {

  const addresses = await addressRepo.getUserAddresses(userId);

  return addresses;
};

export const editAddressService = async (userId, addressId, data) => {

  const existingAddresses = await addressRepo.getUserAddresses(userId);

  const currentAddress = existingAddresses.find(
    a => a._id.toString() === addressId
  );

  if (!currentAddress) {
    const error = new Error("Address not found");
    error.type = "GLOBAL";
    throw error;
  }

  const newAddress = `${data.street}-${data.city}-${data.state}-${data.pincode}`
    .toLowerCase()
    .replace(/\s+/g, "");

  for (const address of existingAddresses) {

    if (address._id.toString() === addressId) continue;

    const existing = `${address.street}-${address.city}-${address.state}-${address.pincode}`
      .toLowerCase()
      .replace(/\s+/g, "");

    if (existing === newAddress) {
      const error = new Error("This address already exists");
      error.type = "GLOBAL";
      throw error;
    }
  }

  if (data.isDefault) {
    await addressRepo.unsetDefaultAddress(userId);
  }

  await addressRepo.updateAddress(addressId, {
    ...data,
    userId
  });

};


export const deleteAddressService = async (userId, addressId) => {

  const address = await addressRepo.getAddressById(addressId);

  if (!address || address.userId.toString() !== userId.toString()) {
    const error = new Error("Address not found");
    error.type = "GLOBAL";
    throw error;
  }

  if (address.isDefault) {
    const error = new Error("Default address cannot be deleted");
    error.type = "GLOBAL";
    throw error;
  }

  await addressRepo.softDeleteAddress(addressId);

};