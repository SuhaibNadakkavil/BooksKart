import { addOfferSchema, updateOfferSchema } from "../../validators/admin/offer.validator.js";
import { addCategoryOfferService, addProductOfferService, deleteCategoryOfferService, deleteProductOfferService, updateCategoryOfferService, updateProductOfferService } from "../../services/admin/offer.service.js";
import HTTP_STATUS from "../../utils/httpStatus.js";


// Add categoty offer controller
export const addCategoryOffer = async (req, res) => {

  try {

    const { error, value } = addOfferSchema.validate(req.body);

    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.details[0].message
      });
    }

    const categoryId = req.params.id;

    await addCategoryOfferService(categoryId, value);

    req.session.success = "Offer added successfully";

    return res.json({
      success: true
    });

  } catch (err) {

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: err.message
    });

  }

};


// Edit category offer controller
export const updateCategoryOffer = async (req, res) => {

  try {

    const { error, value } = updateOfferSchema.validate(req.body);

    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.details[0].message
      });
    }

    const categoryId = req.params.id;

    await updateCategoryOfferService(categoryId, value);

    req.session.success = "Offer updated successfully";

    return res.json({
      success: true
    });

  } catch (err) {

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: err.message
    });

  }

};


// Delete category offer controller
export const deleteCategoryOffer = async (req, res) => {

  try {

    const categoryId = req.params.id;

    await deleteCategoryOfferService(categoryId);

    req.session.success = "Offer deleted successfully";

    return res.json({
      success: true,
      message: "Offer deleted successfully"
    });

  } catch (err) {

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: err.message
    });

  }

};


// Add product offer controller
export const addProductOffer = async (req, res) => {

  try {

    const { error, value } = addOfferSchema.validate(req.body);

    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.details[0].message
      });
    }

    const productId = req.params.id;

    await addProductOfferService(productId, value);

    req.session.success = "Product offer added successfully";

    return res.json({
      success: true
    });

  } catch (err) {

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: err.message
    });

  }

};

// Edit product offer controller
export const updateProductOffer = async (req, res) => {

  try {

    const { error, value } = updateOfferSchema.validate(req.body);

    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.details[0].message
      });
    }

    const productId = req.params.id;

    await updateProductOfferService(productId, value);

    req.session.success = "Product offer updated successfully";

    return res.json({
      success: true
    });

  } catch (err) {

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: err.message
    });

  }

};


export const deleteProductOffer = async (req, res) => {

  try {

    const productId = req.params.id;

    await deleteProductOfferService(productId);

    req.session.success = "Product offer deleted successfully";

    return res.json({
      success: true,
      message: "Offer deleted successfully"
    });

  } catch (err) {

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: err.message
    });

  }

};