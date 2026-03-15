import * as offerRepo from "../../repositories/user/offer.repository.js";
import * as categoryRepo from "../../repositories/user/category.repository.js";
import * as productRepo from '../../repositories/user/product.repository.js'

export const addCategoryOfferService = async (categoryId, data) => {

  const category = await categoryRepo.findCategoryById(categoryId);

  if (!category) {
    throw new Error("Category not found");
  }

  if (!category.isActive) {
    throw new Error("Cannot add offer to inactive category");
  }

  if (category.offer) {
    throw new Error("Category already has an offer");
  }

  const offer = await offerRepo.createOffer({
    type: data.type,
    value: data.value,
    expiryDate: data.expiry,
    targetType: "category",
    targetId: categoryId
  });

  await categoryRepo.updateCategory(categoryId, {
    offer: offer._id
  });

  return offer;

};


export const updateCategoryOfferService = async (categoryId, data) => {

  const category = await categoryRepo.findCategoryById(categoryId);

  if (!category) {
    throw new Error("Category not found");
  }

  if (!category.offer) {
    throw new Error("Offer not found");
  }

  const offerId = category.offer;

  return offerRepo.updateOffer(offerId, {
    type: data.type,
    value: data.value,
    expiryDate: data.expiry
  });

};

export const deleteCategoryOfferService = async (categoryId) => {

  const category = await categoryRepo.findCategoryById(categoryId);

  if (!category) {
    throw new Error("Category not found");
  }

  if (!category.offer) {
    throw new Error("Offer not found");
  }

  const offerId = category.offer;

  // delete offer document
  await offerRepo.deleteOffer(offerId);

  // remove offer reference from category
  await categoryRepo.updateCategory(categoryId, {
    offer: null
  });

};



export const addProductOfferService = async (productId, data) => {

  const product = await productRepo.findProductById(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  if (!product.isActive) {
    throw new Error("Cannot add offer to inactive product");
  }

  if (product.productOffer) {
    throw new Error("Product already has an offer");
  }

  const offer = await offerRepo.createOffer({
    type: data.type,
    value: data.value,
    expiryDate: data.expiry,
    targetType: "product",
    targetId: productId
  });

  await productRepo.updateProduct(productId, {
    productOffer: offer._id
  });

  return offer;

};


export const updateProductOfferService = async (productId, data) => {

  const product = await productRepo.findProductById(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  if (!product.productOffer) {
    throw new Error("Offer not found");
  }

  const offerId = product.productOffer;

  return offerRepo.updateOffer(offerId, {
    type: data.type,
    value: data.value,
    expiryDate: data.expiry
  });

};


export const deleteProductOfferService = async (productId) => {

  const product = await productRepo.findProductById(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  if (!product.productOffer) {
    throw new Error("Offer not found");
  }

  const offerId = product.productOffer;

  // delete offer document
  await offerRepo.deleteOffer(offerId);

  // remove reference from product
  await productRepo.updateProduct(productId, {
    productOffer: null
  });

};