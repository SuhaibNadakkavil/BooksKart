import { 
    getWishlistService, 
    toggleWishlistService,
    removeWishlistItemService,
} from "../../services/user/wishlist.service.js";

import HTTP_STATUS from "../../utils/httpStatus.js";
import * as wishlistRepo from "../../repositories/user/wishlist.repository.js";

export const toggleWishlist = async (req, res, next) => {

  try {

    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login first"
      });
    }

    const { productId, variantType } = req.body;

    const result = await toggleWishlistService({
      userId,
      productId,
      variantType
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      action: result.action,
      message:
        result.action === "added"
          ? "Product added to wishlist"
          : "Product removed from wishlist"
    });

  } catch (err) {
    next(err);
  }

};


export const checkWishlist = async (req, res, next) => {

  try {

    const userId = req.session.userId;

    if (!userId) {
      return res.json({ exists: false });
    }

    const { productId, variantType } = req.params;

    const exists = await wishlistRepo.checkWishlistItem({
      userId,
      productId,
      variantType
    });

    res.json({ exists: !!exists });

  } catch (err) {
    next(err);
  }

};


export const loadWishlistPage = async (req, res, next) => {

  try {

    const success = req.session.success || null;
    const error = req.session.error || null;

    delete req.session.success;
    delete req.session.error;

    const userId = req.user._id;

    const wishlistItems = await getWishlistService(userId);

    // console.log(wishlistItems)

    res.status(HTTP_STATUS.OK).render("user/wishlist", {

      title: "Wishlist | BooksKart",

      headerType: "main",

      success,
      error,

      wishlistItems,

      pageScript: "/js/wishlist.js"

    });

  } catch (err) {
    next(err);
  }

};


/* =========================
   REMOVE ITEM
========================= */

export const removeWishlistItem = async (req, res, next) => {

  try {

    const userId = req.user._id;
    const { productId, variantType } = req.body;

    await removeWishlistItemService({
      userId,
      productId,
      variantType
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Removed from wishlist"
    });

  } catch (err) {
    next(err);
  }

};