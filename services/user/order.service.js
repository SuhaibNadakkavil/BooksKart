import * as cartRepo from "../../repositories/user/cart.repository.js";
import * as orderRepo from "../../repositories/user/order.repository.js";
import * as addressRepo from "../../repositories/user/address.repo.js";
import { validateCheckoutService } from "./checkout.service.js";
import Product from "../../models/user/product.schema.js";

const normalizeVariantType = (type) => {
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
};

export const createOrderService = async ({
  userId,
  addressId,
  paymentMethod
}) => {

  // 1. VALIDATE
  const checkoutData = await validateCheckoutService(userId);

  // 2. ADDRESS
  const address = await addressRepo.getAddressById(userId, addressId);

  if (!address) {
    const error = new Error("Invalid address");
    error.type = "CHECKOUT";
    throw error;
  }

  const addressSnapshot = {
    name: address.name,
    street: address.street,
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    phone: address.phone
  };

  const orderItems = [];

  for (const item of checkoutData.items) {


      const normalizedType = normalizeVariantType(item.variantType);

      const updated = await Product.updateOne(
          {
              _id: item.productId,
              "variants.type": normalizedType,
              "variants.stock": { $gte: item.quantity }
          },
          {
              $inc: { "variants.$.stock": -item.quantity }
          }
      );

    if (updated.modifiedCount === 0) {
      const error = new Error(`${item.title} stock changed, try again`);
      error.type = "CHECKOUT";
      throw error;
    }

    orderItems.push({
      productId: item.productId,
      title: item.title,
      author: item.author,
      variantType: item.variantType,
      quantity: item.quantity,
      price: item.price,
      itemTotal: item.itemTotal,
      image: item.images?.cover
    });
  }

  const orderId = orderRepo.generateOrderId();

  const order = await orderRepo.createOrder({
    orderId,
    userId,
    items: orderItems,
    address: addressSnapshot,
    paymentMethod,
    subtotal: checkoutData.subtotal,
    totalAmount: checkoutData.subtotal
  });

  await cartRepo.clearCart(userId);

  return order;
};


export const getOrderSuccessService = async (userId, orderId) => {

  if (!orderId) {
    const error = new Error("Invalid order");
    error.type = "ORDER";
    throw error;
  }

  const order = await orderRepo.getOrderByOrderId(orderId, userId);

  if (!order) {
    const error = new Error("Order not found");
    error.type = "ORDER";
    throw error;
  }

  return order;
};