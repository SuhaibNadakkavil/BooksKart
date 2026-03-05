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

  await addressRepo.createAddress({
    userId,
    ...data
  });
};

export const getUserAddressesService = async (userId) => {

  const addresses = await addressRepo.getUserAddresses(userId);

  return addresses;
};