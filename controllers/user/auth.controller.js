import { signupService, loginService } from "../../services/user/auth.service.js";
import { signupSchema, loginSchema } from "../../validators/user/auth.validator.js";
import HTTP_STATUS from "../../utils/httpStatus.js";

//signup controller

export const signup = async (req, res, next) => {
  try {
    const { error, value } = signupSchema.validate(req.body, {
      abortEarly: false,
    });

    // Joi validation errors
    if (error) {
      const errors = {};

      error.details.forEach((err) => {
        errors[err.path[0]] = err.message;
      });

      return res.status(HTTP_STATUS.BAD_REQUEST).render("user/signup", {
        title: "Signup | BooksKart",
        headerType: "auth",
        errors,
        old: req.body,
        error: null,
        pageScript: "/js/signup.js",
      });
    }

    const user = await signupService(value);

    req.session.userId = user._id;

    return res.redirect("/");

  } catch (err) {

    // Field errors from service
    if (err.type === "FIELD") {
      return res.status(HTTP_STATUS.BAD_REQUEST).render("user/signup", {
        title: "Signup | BooksKart",
        headerType: "auth",
        errors: { [err.field]: err.message },
        old: req.body,
        error: null,
        pageScript: "/js/signup.js",
      });
    }

    // Global error
    if (err.type === "GLOBAL") {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).render("user/signup", {
        title: "Signup | BooksKart",
        headerType: "auth",
        errors: {},
        old: req.body,
        error: err.message,
        pageScript: "/js/signup.js",
      });
    }

    next(err);
  }
};

export const loadSignup = ((req, res) =>{
  res.render("user/signup", {
      title: "Signup | BooksKart",
      headerType: "auth",
      errors: {},
      old: {},
      error: null,
      pageScript: "/js/signup.js",
    });
})

//login controller

export const login = async (req, res, next) => {
    try {
        const {error, value} = loginSchema.validate(req.body)

        if(error){
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                succeess: false,
                message: error.details[0].message
            })
        }

        const user = await loginService(value)

        req.session.userId = user._id

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Login successful'
        })
    } catch (error) {
        next(error)
    }
}

export const loadLogin = ((req, res) => {
  res.render("user/login", {
    title: "Login | BooksKart",
    headerType: "auth",
    error: null,
    errors: {},
    old: {},
    pageScript: "/js/login.js"
  });
})

//Logout controller

export const logout = async (req, res, next) => {
    try {
        req.session.destroy((err) =>{
            if (err) {
                return next(err)
            }

            res.clearCookie('connect-sid')

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Logout successful"
            })
        })
    } catch (error) {
        next(error)
    }
}
