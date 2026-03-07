export const verifyAdminAuth = (req, res, next) => {

  if (!req.session?.adminId) {
    return res.redirect("/admin/login");
  }

  next();
};