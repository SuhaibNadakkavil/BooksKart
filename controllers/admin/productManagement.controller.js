import {
    getProductsService,
    addProductService,
    updateProductService,
    updateProductStatusService
} from "../../services/admin/productManagement.service.js";

import HTTP_STATUS from "../../utils/httpStatus.js";
import * as categoryRepo from '../../repositories/user/category.repository.js'
import * as productRepo from '../../repositories/user/product.repository.js'
import { createProductSchema } from "../../validators/admin/product.validator.js";

/* ======================================================
LOAD PRODUCT MANAGEMENT PAGE
====================================================== */

export const loadProductManagement = async (req, res, next) => {

    try {

        const success = req.session.success || null;
        const error = req.session.error || null;

        delete req.session.success;
        delete req.session.error;

        const data = await getProductsService(req.query);

        res.status(HTTP_STATUS.OK).render("admin/productManagement", {

            title: "Product Management | BooksKart",

            products: data.products,
            totalProducts: data.totalProducts,
            page: data.page,
            totalPages: data.totalPages,

            query: req.query,

            success,
            error,

            pageScript: "/js/adminProductManagement.js"

        });

    } catch (err) {
        next(err);
    }

};


export const loadAddProductPage = async (req, res, next) => {

    try {

        const success = req.session.success || null;
        const error = req.session.error || null;

        delete req.session.success;
        delete req.session.error;

        const categories = await categoryRepo.findCategories({
            skip: 0,
            limit: 100,
            filter: { isActive: true, isDeleted: false },
            sort: { name: 1 }
        });

        res.status(HTTP_STATUS.OK).render("admin/addProduct", {
            title: "Add Product | BooksKart",
            success,
            error,
            categories,
            errors: {},
            old: {},
            pageScript: "/js/adminAddProduct.js"
        });

    } catch (err) {
        next(err);
    }

};


export const addProduct = async (req, res, next) => {

    const categories = await categoryRepo.findCategories({
        skip: 0,
        limit: 100,
        filter: { isActive: true, isDeleted: false },
        sort: { name: 1 }
    });

    if (req.fileValidationError) {

        return res.status(HTTP_STATUS.BAD_REQUEST).render("admin/addProduct", {
            title: "Add Product | BooksKart",
            categories,
            errors: {},
            old: {
                ...req.body,
                variants
            },
            error: req.fileValidationError,
            success: null,
            pageScript: "/js/adminAddProduct.js"
        });

    }

    const types = Array.isArray(req.body.variantType)
        ? req.body.variantType
        : [req.body.variantType];

    const prices = Array.isArray(req.body.regularPrice)
        ? req.body.regularPrice
        : [req.body.regularPrice];

    const stocks = Array.isArray(req.body.stock)
        ? req.body.stock
        : [req.body.stock];

    const variants = types.map((type, i) => ({
        type,
        regularPrice: Number(prices[i]),
        stock: Number(stocks[i])
    }));

    delete req.body.variantType;
    delete req.body.regularPrice;
    delete req.body.stock;

    req.body.variants = variants;


    const { error, value } = createProductSchema.validate(req.body, {
        abortEarly: false
    });

    if (error) {

        const errors = {};

        error.details.forEach(err => {
            errors[err.path[0]] = err.message;
        });

        return res.status(HTTP_STATUS.BAD_REQUEST).render("admin/addProduct", {
            title: "Add Product | BooksKart",
            categories,
            errors,
            old: {
                ...req.body,
                variants
            },
            error: null,
            success: null,
            pageScript: "/js/adminAddProduct.js"
        });

    }

    try {

        await addProductService({
            ...value,
            variants
        }, req.files)

        req.session.success = "Product added successfully";

        return res.redirect("/admin/products");

    } catch (err) {

        if (err.type === "GLOBAL") {

            return res.status(HTTP_STATUS.BAD_REQUEST).render("admin/addProduct", {
                title: "Add Product | BooksKart",
                categories,
                errors: {},
                old: {
                    ...req.body,
                    variants
                },
                error: err.message,
                success: null,
                pageScript: "/js/adminAddProduct.js"
            });

        }

        next(err);

    }

};



export const loadEditProductPage = async (req, res, next) => {

  try {

    const { id } = req.params;

    const success = req.session.success || null;
    const error = req.session.error || null;

    delete req.session.success;
    delete req.session.error;

    const product = await productRepo.findProductById(id);

    if (!product || product.isDeleted) {

      req.session.error = "Product not found";

      return res.redirect("/admin/products");

    }

    const categories = await categoryRepo.findCategories({
      skip: 0,
      limit: 100,
      filter: { isActive: true, isDeleted: false },
      sort: { name: 1 }
    });

    res.status(HTTP_STATUS.OK).render("admin/editProduct", {

      title: "Edit Product | BooksKart",

      product,
      categories,

      success,
      error,

      errors: {},
      old: product,

      pageScript: "/js/adminEditProduct.js"

    });

  } catch (err) {

    next(err);

  }

};



export const updateProduct = async (req, res, next) => {

  const { id } = req.params;

  const product = await productRepo.findProductById(id);

  const categories = await categoryRepo.findCategories({
    skip: 0,
    limit: 100,
    filter: { isActive: true, isDeleted: false },
    sort: { name: 1 }
  });


  if (!product) {

    req.session.error = "Product not found";
    return res.redirect("/admin/products");

  }


  if (req.fileValidationError) {

    return res.status(HTTP_STATUS.BAD_REQUEST).render("admin/editProduct", {
      title: "Edit Product | BooksKart",
      product,
      categories,
      errors: {},
      old: req.body,
      error: req.fileValidationError,
      success: null,
      pageScript: "/js/adminEditProduct.js"
    });

  }



  /* =========================
  VARIANTS TRANSFORM
  ========================= */

  const types = Array.isArray(req.body.variantType)
    ? req.body.variantType
    : [req.body.variantType];

  const prices = Array.isArray(req.body.regularPrice)
    ? req.body.regularPrice
    : [req.body.regularPrice];

  const stocks = Array.isArray(req.body.stock)
    ? req.body.stock
    : [req.body.stock];

  const variants = types.map((type, i) => ({
    type,
    regularPrice: Number(prices[i]),
    stock: Number(stocks[i])
  }));

  delete req.body.variantType;
  delete req.body.regularPrice;
  delete req.body.stock;

  req.body.variants = variants;
  req.body.images = product.images;


  /* =========================
  VALIDATION
  ========================= */

  const { error, value } = createProductSchema.validate(req.body, {
    abortEarly: false
  });

  if (error) {

    const errors = {};

    error.details.forEach(err => {
      errors[err.path[0]] = err.message;
    });

    return res.status(HTTP_STATUS.BAD_REQUEST).render("admin/editProduct", {
      title: "Edit Product | BooksKart",
      product,
      categories,
      errors,
      old: req.body,
      error: null,
      success: null,
      pageScript: "/js/adminEditProduct.js"
    });

  }



  try {

    await updateProductService(id, {
      ...value,
      variants
    }, req.files, product);

    req.session.success = "Product updated successfully";

    return res.redirect("/admin/products");

  } catch (err) {

    if (err.type === "GLOBAL") {

      return res.status(HTTP_STATUS.BAD_REQUEST).render("admin/editProduct", {
        title: "Edit Product | BooksKart",
        product,
        categories,
        errors: {},
        old: req.body,
        error: err.message,
        success: null,
        pageScript: "/js/adminEditProduct.js"
      });

    }

    next(err);

  }

};


/* ======================================================
ACTIVATE PRODUCT
====================================================== */

export const activateProduct = async (req, res, next) => {

    try {

        const { id } = req.params;

        await updateProductStatusService(id, true);

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Product activated successfully"
        });

    } catch (err) {
        next(err);
    }

};



/* ======================================================
DEACTIVATE PRODUCT
====================================================== */

export const deactivateProduct = async (req, res, next) => {

    try {

        const { id } = req.params;

        await updateProductStatusService(id, false);

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Product deactivated successfully"
        });

    } catch (err) {
        next(err);
    }

};