import { adminLoginSchema } from "../../validators/admin/adminAuth.validator.js";
import HTTP_STATUS from '../../utils/httpStatus.js'
import { adminLoginService } from "../../services/admin/adminAuth.service.js";

export const loadLoginPage = (req, res) => {

    if (req.session?.adminId) {
        return res.redirect("/admin/dashboard");
    }

    res.render("admin/login", {
        errors: {},
        old: {},
        layout: false,
    });
};


export const login = async (req, res, next) => {

  try {

    const { error, value } = adminLoginSchema.validate(req.body, {
      abortEarly: false
    });

    // Joi Validation Errors
    if (error) {

      const errors = {};

      error.details.forEach((err) => {
        errors[err.path[0]] = err.message;
      });

      return res.status(HTTP_STATUS.BAD_REQUEST).render("admin/login", {
        layout: false,
        errors,
        old: req.body,
      });
    }

    const admin = await adminLoginService(value);

    req.session.regenerate((err) => {
      if (err) return next(err);

      req.session.adminId = admin._id;
      req.session.isAdminAuthenticated = true;

      return res.redirect("/admin/dashboard");
    });

  } catch (err) {

    // Field Errors
    if (err.type === "FIELD") {
      return res.status(HTTP_STATUS.BAD_REQUEST).render("admin/login", {
        layout: false,
        errors: { [err.field]: err.message },
        old: req.body,
        error: null
      });
    }

    next(err);
  }

};