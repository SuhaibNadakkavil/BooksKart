import { signupService, loginService } from "../../services/user/auth.service.js";
import { signupSchema, loginSchema } from "../../validators/user/auth.validator.js";
import HTTP_STATUS from "../../utils/httpStatus.js";
import { deleteSignupOTP, getSignupOTP, resendSignupOTPService } from "../../services/user/otp.service.js";
import * as userRepo from '../../repositories/user/user.repository.js'

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
        success:null,
        pageScript: "/js/signup.js",
      });
    }

    const result = await signupService(value);

    return res.redirect(`/verify-otp?email=${result.email}`);

  } catch (err) {

    // Field errors from service
    if (err.type === "FIELD") {
      return res.status(HTTP_STATUS.BAD_REQUEST).render("user/signup", {
        title: "Signup | BooksKart",
        headerType: "auth",
        errors: { [err.field]: err.message },
        old: req.body,
        error: null,
        success:null,
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
        success:null,
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
      success:null,
      pageScript: "/js/signup.js",
    });
})

export const loadVerifyOtp = (req, res) => {
  res.render("user/verify-otp", {
    title: "Verify Email | BooksKart",
    headerType: "auth",
    error: null,
    success:null,
    email: req.query.email || "",
    pageScript: "/js/verify-otp.js",
  });
};

export const verifySignupOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body

    const storedData = await getSignupOTP(email)

    if (!storedData) {
      return res.render("user/verify-otp", {
        title: "Verify Email | BooksKart",
        headerType: "auth",
        error: "OTP expired. Please signup again.",
        success:null,
        email,
        pageScript: "/js/verify-otp.js",
      })
    }

    if (storedData.otp !== otp) {
      return res.render("user/verify-otp", {
        title: "Verify Email | BooksKart",
        headerType: "auth",
        error: "Invalid OTP",
        success:null,
        email,
        pageScript: "/js/verify-otp.js",
      })
    }

    const user = await userRepo.createUser({
      ...storedData.userData,
      isVerified: true,
    });

    await deleteSignupOTP(email)

    req.session.userId = user._id

    return res.redirect("/")


  } catch (error) {
    next(error)
  }
}

export const resendSignupOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    await resendSignupOTPService(email);

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully"
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Something went wrong"
    });
  }
};

export const googleCallback = async (req, res, next) => {
  try {

    if (!req.user) {
      return res.redirect("/login");
    }

    req.session.userId = req.user._id;

    return res.redirect("/");

  } catch (error) {
    next(error);
  }
};

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
    success:null,
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
