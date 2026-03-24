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
      activePage: 'users',

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

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "User blocked successfully"
    });

  } catch (err) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};


export const unblockUser = async (req, res, next) => {
  try {

    const { id } = req.params;

    await unblockUserService(id);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "User unblocked successfully"
    });

  } catch (err) {

    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: err.message || "Something went wrong",
    });
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