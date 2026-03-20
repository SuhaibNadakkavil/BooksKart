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


export const getCartService = async (userId) => {

  const items = await cartRepo.findCartProducts(userId);

  let subtotal = 0;
  let totalItems = 0;

  for (const item of items) {

    const variant = item.variants.find(
      v => v.type.toLowerCase() === item.variantType.toLowerCase()
    );

    if (!variant) {
      item.selectedVariant = null;
      continue;
    }

    const productOffer = item.productOffer;
    const categoryOffer = item.category?.offer;

    const appliedOffer = productOffer || categoryOffer || null;

    variant.salePrice = calculateSalePrice(
      variant.regularPrice,
      appliedOffer
    );

    item.selectedVariant = variant;

    item.isOutOfStock = variant.stock <= 0;

    if (item.quantity > variant.stock) {

    await cartRepo.updateCartItemQuantity({
        userId,
        productId: item.productId,
        variantType: item.variantType,
        quantity: variant.stock
    });

    item.quantity = variant.stock;
    }

    const itemTotal = variant.salePrice * item.quantity;

    item.itemTotal = itemTotal;

    subtotal += itemTotal;
    totalItems += item.quantity;

  }

  return {
    items,
    subtotal,
    totalItems
  };

};


export const addToCartService = async ({
  userId,
  product,
  variantType,
  quantity = 1
}) => {

  if (!product || !product.isActive || product.isDeleted) {
    throw new Error("Product unavailable");
  }

  const variant = product.variants.find(
    v => v.type.toLowerCase() === variantType.toLowerCase()
  );

  if (!variant) throw new Error("Invalid variant");

  if (variant.stock <= 0) throw new Error("Out of stock");

  const cart = await cartRepo.findCartByUser(userId);

  const existingItem = cart?.items.find(
    item =>
      item.productId.toString() === product._id.toString() &&
      item.variantType.toLowerCase() === variantType.toLowerCase()
  );

  const newQty = (existingItem?.quantity || 0) + quantity;

  /* 🔥 MAX LIMIT CHECK */
  if (newQty > MAX_CART_QTY) {
    throw new Error(`Maximum ${MAX_CART_QTY} items allowed`);
  }

  /* 🔥 STOCK CHECK */
  if (newQty > variant.stock) {
    throw new Error(`Only ${variant.stock} items available`);
  }

  const result = await cartRepo.addToCart({
    userId,
    productId: product._id,
    variantType,
    quantity
  });

  return result;
};


export const updateCartQuantityService = async ({
  userId,
  product,
  variantType,
  quantity
}) => {

  const variant = product.variants.find(
    v => v.type.toLowerCase() === variantType.toLowerCase()
  );

  if (!variant) {
    throw new Error("Invalid variant");
  }

  if (quantity < 1) {
    throw new Error("Invalid quantity");
  }

  /* 🔥 MAX LIMIT CHECK */
  if (quantity > MAX_CART_QTY) {
    throw new Error(`Maximum ${MAX_CART_QTY} items allowed`);
  }

  /* 🔥 STOCK CHECK */
  if (quantity > variant.stock) {
    throw new Error(`Only ${variant.stock} items available`);
  }

  await cartRepo.updateCartItemQuantity({
    userId,
    productId: product._id,
    variantType,
    quantity
  });

};


export const removeCartItemService = async ({
  userId,
  productId,
  variantType
}) => {

  await cartRepo.removeCartItem({
    userId,
    productId,
    variantType
  });

};