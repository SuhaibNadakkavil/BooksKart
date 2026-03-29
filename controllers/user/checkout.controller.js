import HTTP_STATUS from "../../utils/httpStatus.js";
import { validateCheckoutService } from "../../services/user/checkout.service.js";
import { addressSchema } from "../../validators/user/address.validator.js";
import { 
    getUserAddressesService,
    addAddressService,
    editAddressService
 } from "../../services/user/address.service.js";

export const loadCheckoutPage = async (req, res, next) => {
  try {

    const success = req.session.success || null;
    const error = req.session.error || null;

    delete req.session.success;
    delete req.session.error;

    const userId = req.user._id;

    let checkoutData = null;
    let checkoutError = null;

    try {
      checkoutData = await validateCheckoutService(userId);
    } catch (err) {
      if (err.type === "CHECKOUT") {
        checkoutError = err.message;
      } else {
        throw err;
      }
    }

    const addresses = await getUserAddressesService(userId);

    res.status(HTTP_STATUS.OK).render("user/checkout", {
      title: "Checkout | BooksKart",
      headerType: "main",
      success,
      error,

      // ✅ validated data
      checkoutData,
      checkoutError,

      // fallback UI handling
      cartItems: checkoutData?.items || [],
      subtotal: checkoutData?.subtotal || 0,
      totalItems: checkoutData?.totalItems || 0,

      addresses,

      pageScript: "/js/checkout.js"
    });

  } catch (err) {
    next(err);
  }
};


export const addAddressFromCheckout = async (req, res, next) => {

  try {

    // normalize boolean
    req.body.isDefault = req.body.isDefault === true || req.body.isDefault === "true";

    // validate
    const { error, value } = addressSchema.validate(req.body, {
      abortEarly: false
    });

    if (error) {

      const errors = {};

      error.details.forEach((err) => {
        errors[err.path[0]] = err.message;
      });

      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Validation failed",
        errors
      });
    }

    // call service
    const address = await addAddressService(req.user._id, value);

    // IMPORTANT: return created address (modify service if needed)
    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "Address added successfully",
      address
    });

  } catch (err) {

    if (err.type === "GLOBAL") {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: err.message
      });
    }

    next(err);
  }
};


export const editAddressFromCheckout = async (req, res, next) => {

  try {

    const { id } = req.params;

    // normalize boolean
    req.body.isDefault = req.body.isDefault === true || req.body.isDefault === "true";

    // validate
    const { error, value } = addressSchema.validate(req.body, {
      abortEarly: false
    });

    if (error) {

      const errors = {};

      error.details.forEach(err => {
        errors[err.path[0]] = err.message;
      });

      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Validation failed",
        errors
      });
    }

    // call service
    await editAddressService(req.user._id, id, value);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Address updated successfully"
    });

  } catch (err) {

    if (err.type === "GLOBAL") {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: err.message
      });
    }

    next(err);
  }
};