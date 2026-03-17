import * as wishlistRepo from "../../repositories/user/wishlist.repository.js";
import * as productRepo from "../../repositories/user/product.repository.js";

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

export const toggleWishlistService = async ({
  userId,
  productId,
  variantType
}) => {

  /* ==============================
     VALIDATE PRODUCT
  ============================== */

  const product = await productRepo.findProductById(productId);

  if (!product || product.isDeleted) {
    throw new Error("Product not found");
  }

  /* ==============================
     CHECK IF EXISTS
  ============================== */

  const exists = await wishlistRepo.checkWishlistItem({
    userId,
    productId,
    variantType
  });

  if (exists) {

    await wishlistRepo.removeFromWishlist({
      userId,
      productId,
      variantType
    });

    return { action: "removed" };

  }

  await wishlistRepo.addToWishlist({
    userId,
    productId,
    variantType
  });

  return { action: "added" };

};


export const getWishlistService = async (userId) => {

  const wishlistItems = await wishlistRepo.findWishlistProducts(userId);

  for (const item of wishlistItems) {

    const productOffer = item.productOffer;
    const categoryOffer = item.category?.offer;

    const appliedOffer = productOffer || categoryOffer || null;

    const variant = item.variants.find(
      v => v.type.toLowerCase() === item.variantType.toLowerCase()
    );

    if (!variant) {
      item.selectedVariant = null;
      continue;
    }

    variant.salePrice = calculateSalePrice(
      variant.regularPrice,
      appliedOffer
    );

    item.selectedVariant = variant;

  }

  return wishlistItems;

};


export const removeWishlistItemService = async ({
  userId,
  productId,
  variantType
}) => {

  await wishlistRepo.removeFromWishlist({
    userId,
    productId,
    variantType
  });

};


export const moveWishlistToCartService = async ({
  userId,
  productId,
  variantType
}) => {

  /* cart logic will go here later */

  await wishlistRepo.removeFromWishlist({
    userId,
    productId,
    variantType
  });

};