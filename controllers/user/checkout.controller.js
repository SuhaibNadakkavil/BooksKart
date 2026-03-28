import HTTP_STATUS from "../../utils/httpStatus.js";
import { getCartService } from "../../services/user/cart.service.js";
import { getUserAddressesService } from "../../services/user/address.service.js";

export const loadCheckoutPage = async (req, res, next) => {
  try {

    const success = req.session.success || null;
    const error = req.session.error || null;

    delete req.session.success;
    delete req.session.error;

    const userId = req.user._id;

    // ✅ Reuse cart logic
    const { items, subtotal, totalItems, hasInvalidItems } =
      await getCartService(userId);

    // ✅ Reuse address logic
    const addresses = await getUserAddressesService(userId);

    res.status(HTTP_STATUS.OK).render("user/checkout", {
      title: "Checkout | BooksKart",
      headerType: "main",
      success,
      error,

      // cart data
      cartItems: items,
      subtotal,
      totalItems,
      hasInvalidItems,

      // address data
      addresses,

      pageScript: "/js/checkout.js"
    });

  } catch (err) {
    next(err);
  }
};