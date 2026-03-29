import * as cartRepo from "../../repositories/user/cart.repository.js";

const MAX_CART_QTY = 5;

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


// =============================
// VALIDATE CHECKOUT
// =============================
export const validateCheckoutService = async (userId) => {

  const items = await cartRepo.findCartProducts(userId);

  if (!items.length) {
    const error = new Error("Cart is empty");
    error.type = "CHECKOUT";
    throw error;
  }

  let subtotal = 0;
  let totalItems = 0;

  const validatedItems = [];

  for (const item of items) {

    // =============================
    // VARIANT CHECK
    // =============================
    const variant = item.variants.find(
      v => v.type.toLowerCase() === item.variantType.toLowerCase()
    );

    if (!variant) {
      const error = new Error(`${item.title} variant not found`);
      error.type = "CHECKOUT";
      throw error;
    }

    // =============================
    // PRODUCT STATUS CHECK
    // =============================
    const isUnavailable =
      !item.category.isActive ||
      item.category.isDeleted ||
      !item.isActive ||
      item.isDeleted;

    if (isUnavailable) {
      const error = new Error(`${item.title} is unavailable`);
      error.type = "CHECKOUT";
      throw error;
    }

    // =============================
    // STOCK CHECK
    // =============================
    if (variant.stock <= 0) {
      const error = new Error(`${item.title} is out of stock`);
      error.type = "CHECKOUT";
      throw error;
    }

    if (item.quantity > variant.stock) {
      const error = new Error(
        `${item.title} only ${variant.stock} items available`
      );
      error.type = "CHECKOUT";
      throw error;
    }

    // =============================
    // MAX QTY CHECK
    // =============================
    if (item.quantity > MAX_CART_QTY) {
      const error = new Error(
        `${item.title} exceeds maximum allowed quantity`
      );
      error.type = "CHECKOUT";
      throw error;
    }

    // =============================
    // PRICE RE-CALCULATION
    // =============================
    const productOffer = item.productOffer;
    const categoryOffer = item.category?.offer;

    const appliedOffer = productOffer || categoryOffer || null;

    const salePrice = calculateSalePrice(
      variant.regularPrice,
      appliedOffer
    );

    const itemTotal = salePrice * item.quantity;

    subtotal += itemTotal;
    totalItems += item.quantity;

    // =============================
    // PUSH VALIDATED ITEM
    // =============================
    validatedItems.push({
      productId: item.productId,
      title: item.title,
      author: item.author,
      variantType: item.variantType,
      quantity: item.quantity,
      price: salePrice,
      itemTotal,
      images: {
        cover: item.images?.cover
      }
    });

  }

  return {
    items: validatedItems,
    subtotal,
    totalItems
  };

};