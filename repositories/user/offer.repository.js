import Offer from "../../models/user/offer.schema.js";

export const createOffer = async (data) => {

  return Offer.create(data);

};

export const updateOffer = async (offerId, data) => {

  return Offer.findByIdAndUpdate(
    offerId,
    data,
    { new: true }
  );

};

export const deleteOffer = async (offerId) => {
  return Offer.findByIdAndDelete(offerId);
};