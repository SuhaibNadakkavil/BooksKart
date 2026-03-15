import { getNewArrivalProductsService } from "../../services/user/product.service.js";

export const loadHome = async (req, res, next) => {

  try {

    const isAuth = !!req.session.userId;

    const success = req.session.success || null;
    const error = req.session.error || null;

    delete req.session.success;
    delete req.session.error;

    const newArrivals = await getNewArrivalProductsService();

    res.render("user/home", {
      title: "Home | BooksKart",
      headerType: isAuth ? "main" : "landing",
      success,
      error,
      newArrivals,
      pageScript: null,
    });

  } catch (err) {
    next(err);
  }

};