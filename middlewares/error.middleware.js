import HTTP_STATUS from "../utils/httpStatus.js";

const errorMiddleware = (err, req, res, next) => {

  // If response already sent, delegate to Express
  if (res.headersSent) {
    return next(err);
  }

  console.log(req.method, req.originalUrl);

  // Default to 500 if not specified
  const statusCode =
    err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;

  const isAuth = !!req.session.userId;

  if (statusCode === HTTP_STATUS.NOT_FOUND) {
    return res.status(HTTP_STATUS.NOT_FOUND).render("user/404", {
      title: "Page Not Found | BooksKart",
      headerType: isAuth ? "main" : "landing",
      success: null,
      error: null,
      pageScript: null,
    });
  }

  return res.status(statusCode).render("user/500", {
    title: "Server Error | BooksKart",
    headerType: isAuth ? "main" : "landing",
    success: null,
    error: null,
    pageScript: null,
  });
};

export default errorMiddleware;