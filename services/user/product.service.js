import * as productRepo from '../../repositories/user/product.repository.js'

// Final price calculation logic
const calculateSalePrice = (price, offer) => {

  if (!offer) return price;

  if (offer.type === "percentage") {
    return Math.max(1, Math.round(price - (price * offer.value) / 100));
  }

  if (offer.type === "flat") {
    return Math.max(1, price - offer.value);
  }

  return price;
};


export const getNewArrivalProductsService = async () => {

  const products = await productRepo.findNewArrivalProducts(4);

  for (const product of products) {

    const productOffer = product.productOffer;
    const categoryOffer = product.category?.offer;

    const appliedOffer = productOffer || categoryOffer || null;

    for (const variant of product.variants) {

      variant.salePrice = calculateSalePrice(
        variant.regularPrice,
        appliedOffer
      );

    }

  }

  return products;

};