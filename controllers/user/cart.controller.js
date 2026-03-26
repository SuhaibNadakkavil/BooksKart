import { 
    addToCartService, 
    getCartService, 
    removeCartItemService, 
    updateCartQuantityService 
} from "../../services/user/cart.service.js";

import * as productRepo from "../../repositories/user/product.repository.js";
import * as cartRepo from '../../repositories/user/cart.repository.js'
import * as wishlistRepo from '../../repositories/user/wishlist.repository.js'
import HTTP_STATUS from "../../utils/httpStatus.js";


export const loadCartPage = async (req, res, next) => {
  try {

    const success = req.session.success || null;
    const error = req.session.error || null;

    delete req.session.success;
    delete req.session.error;

    const userId = req.user._id;

    const { items, subtotal, totalItems, hasInvalidItems } =
      await getCartService(userId);

    res.status(HTTP_STATUS.OK).render("user/cart", {
      title: "Cart | BooksKart",
      headerType: "main",
      success,
      error,
      cartItems: items,
      subtotal,
      totalItems,
      hasInvalidItems,
      pageScript: "/js/cart.js"
    });

  } catch (err) {
    next(err);
  }
};


export const addToCart = async (req, res, next) => {
  try {

    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login first"
      });
    }

    const { productId, variantType } = req.body;

    const product = await productRepo.findProductById(productId);

    const result = await addToCartService({
      userId,
      product,
      variantType,
      quantity: 1
    });

    /* 🔥 REMOVE FROM WISHLIST (if exists) */
    await wishlistRepo.removeFromWishlist({
      userId,
      productId,
      variantType
    });

    let message = "";

    if (result.action === "added") {
      message = "Added to cart";
    } else {
      message = "Quantity updated";
    }

    res.json({
      success: true,
      action: result.action,
      message
    });

  } catch (err) {

    if(err){
        return res.status(401).json({
        success: false,
        message: err.message
      });
    }
    next(err);
  }
};



export const updateCartQuantity = async (req, res, next) => {
  try {

    const userId = req.user._id;
    const { productId, variantType, quantity } = req.body;

    const product = await productRepo.findProductById(productId);

    const result = await updateCartQuantityService({
      userId,
      product,
      variantType,
      quantity
    });

    res.status(200).json({
      success: true,
      message: result.maxReached
        ? "Maximum quantity reached"
        : result.stockReached
        ? "Stock limit reached"
        : "Quantity updated",
      data: result
    });

  } catch (err) {

    if(err){
        return res.status(401).json({
        success: false,
        message: err.message
      });
    }
    next(err);
  }
};


export const removeCartItem = async (req, res, next) => {
  try {

    const userId = req.user._id;
    const { productId, variantType } = req.body;

    await removeCartItemService({
      userId,
      productId,
      variantType
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Removed from cart"
    });

  } catch (err) {
    next(err);
  }
};


export const getCartCount = async (req, res) => {
  try {

    const userId = req.session.userId;

    if (!userId) {
      return res.json({ count: 0 });
    }

    const count = await cartRepo.getCartCountByUser(userId);

    res.json({ count });

  } catch (err) {
    console.error(err);
    res.json({ count: 0 });
  }
};