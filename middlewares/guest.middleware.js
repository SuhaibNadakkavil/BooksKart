export const preventAuthPages = (req, res, next) => {
  if (req.session?.userId) {
    return res.redirect("/");
  }
  next();
};