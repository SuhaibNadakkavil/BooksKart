import { 
    blockUserService, 
    getUsersService, 
    unblockUserService 
} from "../../services/admin/userManagement.service.js";

import HTTP_STATUS from "../../utils/httpStatus.js";


export const loadUserManagement = async (req, res, next) => {

  try {

    const success = req.session.success || null;
    const error = req.session.error || null;

    delete req.session.success;
    delete req.session.error;

    const data = await getUsersService(req.query);

    res.status(HTTP_STATUS.OK).render("admin/userManagement", {

      title: "Customer Management | BooksKart",

      users: data.users,
      totalUsers: data.totalUsers,
      page: data.page,
      totalPages: data.totalPages,

      query: req.query,

      success,
      error,

      pageScript: "/js/adminUserManagement.js"

    });

  } catch (err) {
    next(err);
  }

};

export const blockUser = async (req, res, next) => {

  try {

    const { id } = req.params;

    await blockUserService(id);

    req.session.success = "User blocked successfully";

    return res.redirect(req.get("referer") || "/admin/users");

  } catch (err) {

    req.session.error = err.message || "Something went wrong";

    return res.redirect(req.get("referer") || "/admin/users");

  }

};


export const unblockUser = async (req, res, next) => {

  try {

    const { id } = req.params;

    await unblockUserService(id);

    req.session.success = "User unblocked successfully";

    return res.redirect(req.get("referer") || "/admin/users");

  } catch (err) {

    req.session.error = err.message || "Something went wrong";

    return res.redirect(req.get("referer") || "/admin/users");

  }

};


export const logout = (req, res, next) => {

  req.session.destroy((err) => {

    if (err) {
      return next(err);
    }

    res.clearCookie("bookskart.sid");

    return res.redirect("/admin/login");

  });

};