import { getProductDetailsService, getShopProductsService } from "../../services/user/product.service.js";
import HTTP_STATUS from "../../utils/httpStatus.js";

export const loadShopPage = async (req, res, next) => {

  try {

    const isAuth = !!req.session.userId;

    const success = req.session.success || null;
    const error = req.session.error || null;

    delete req.session.success;
    delete req.session.error;

    const { products, categories, totalProducts, page, totalPages } =
      await getShopProductsService(req.query);

    res.status(HTTP_STATUS.OK).render("user/shop", {

      title: "Shop | BooksKart",

      headerType: isAuth ? "main" : "landing",

      success,
      error,

      products,
      totalProducts,
      page,
      totalPages,

      categories,

      query: req.query,

      pageScript: "/js/shop.js"

    });

  } catch (err) {

    next(err);

  }

};


export const loadProductDetailsPage = async (req, res, next) => {

  try {

    const isAuth = !!req.session.userId;

    const success = req.session.success || null;
    const error = req.session.error || null;

    delete req.session.success;
    delete req.session.error;

    const { slug } = req.params;

    const data = await getProductDetailsService(slug);

    /* ==============================
       PRODUCT NOT FOUND
    ============================== */

    if (!data) {
      return res.redirect("/shop");
    }

    /* ==============================
       BLOCKED PRODUCT
    ============================== */

    if (data.blocked) {
      return res.redirect("/shop");
    }

    const { product, relatedProducts } = data;

    res.status(HTTP_STATUS.OK).render("user/productDetails", {

      title: `${product.title} | BooksKart`,

      headerType: isAuth ? "main" : "landing",

      success,
      error,
      reviews: [],
      product,
      relatedProducts,

      pageScript: "/js/productDetails.js"

    });

  } catch (err) {

    next(err);

  }

};