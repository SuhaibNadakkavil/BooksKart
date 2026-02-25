import { signupService, loginService, verifyResetOTPService, forgotPasswordService, setNewPasswordService } from "../../services/user/auth.service.js";
import { signupSchema, loginSchema, forgotPasswordSchema, setNewPasswordSchema } from "../../validators/user/auth.validator.js";
import HTTP_STATUS from "../../utils/httpStatus.js";
import { deleteSignupOTP, getSignupOTP, resendSignupOTPService, getResetOTP, resendResetOTPService } from "../../services/user/otp.service.js";
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

  const email = req.query.email || "";
  const mode = req.query.mode === "reset" ? "reset" : "signup";

  res.render("user/verify-otp", {
    mode,
    title: mode === "reset"
      ? "Verify OTP | BooksKart"
      : "Verify Email | BooksKart",
    headerType: "auth",
    error: null,
    success: null,
    email,
    pageScript: "/js/verify-otp.js",
  });
};

export const verifySignupOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body

    const storedData = await getSignupOTP(email)

    if (!storedData) {
      return res.render("user/verify-otp", {
        mode: "signup",
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
        mode: "signup",
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
        const {error, value} = loginSchema.validate(req.body,{
          abortEarly:false,
        })

            // Joi validation errors
        if (error) {
          const errors = {};

          error.details.forEach((err) => {
            errors[err.path[0]] = err.message;
          });

          return res.status(HTTP_STATUS.BAD_REQUEST).render("user/login", {
            title: "Login | BooksKart",
            headerType: "auth",
            errors,
            old: req.body,
            error: null,
            success:null,
            pageScript: "/js/login.js",
          });
        }

        const user = await loginService(value)

        req.session.userId = user._id

        return res.redirect('/')
    } catch (err) {

        // Field errors from service
      if (err.type === "FIELD") {
        return res.status(HTTP_STATUS.BAD_REQUEST).render("user/login", {
          title: "Login | BooksKart",
          headerType: "auth",
          errors: { [err.field]: err.message },
          old: req.body,
          error: null,
          success:null,
          pageScript: "/js/login.js",
        });
      }

      // Global error
      if (err.type === "GLOBAL") {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).render("user/login", {
          title: "Login | BooksKart",
          headerType: "auth",
          errors: {},
          old: req.body,
          error: err.message,
          success:null,
          pageScript: "/js/login.js",
        });
      }

      next(err)
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

export const loadForgotPassword = (req, res) => {
  res.render("user/forgot-password", {
    title: "Forgot Password | BooksKart",
    headerType: "auth",
    errors: {},
    old: {},
    error: null,
    success: null,
    pageScript: "/js/forgot-password.js",
  });
};

export const sendForgotPasswordOTP = async (req, res, next) => {

  try {

    const { error, value } = forgotPasswordSchema.validate(req.body, {
      abortEarly: false,
    });

    // Joi errors
    if (error) {
      const errors = {};

      error.details.forEach((err) => {
        errors[err.path[0]] = err.message;
      });

      return res.status(HTTP_STATUS.BAD_REQUEST).render(
        "user/forgot-password",
        {
          title: "Forgot Password | BooksKart",
          headerType: "auth",
          errors,
          old: req.body,
          error: null,
          success: null,
          pageScript: "/js/forgot-password.js",
        }
      );
    }

    const normalizedEmail = value.email.toLowerCase().trim();

    await forgotPasswordService(normalizedEmail);

    return res.redirect(
      `/verify-otp?email=${encodeURIComponent(normalizedEmail)}&mode=reset`
    );

  } catch (err) {
    console.error("Forgot password error:", err)
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).render(
      "user/forgot-password",
      {
        title: "Forgot Password | BooksKart",
        headerType: "auth",
        errors: {},
        old: req.body,
        error: "Something went wrong. Please try again.",
        success: null,
        pageScript: "/js/forgot-password.js",
      }
    );
  }
};


export const resendResetOTP = async (req, res) => {
  try {

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Invalid request"
      });
    }

    await resendResetOTPService(email);

    return res.json({
      success: true,
      message: "OTP resent successfully"
    });

  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Something went wrong"
    });
  }
};


export const verifyResetOTP = async (req, res, next) => {

  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.render("user/verify-otp", {
      mode: "reset",
      title: "Verify OTP | BooksKart",
      headerType: "auth",
      error: "Invalid request",
      success: null,
      email: email || "",
      pageScript: "/js/verify-otp.js",
    });
  }

  try {

    await verifyResetOTPService(email, otp);

    return res.redirect(`/set-new-password?email=${email}`);

  } catch (err) {

    return res.render("user/verify-otp", {
      mode: "reset",
      title: "Verify OTP | BooksKart",
      headerType: "auth",
      error: err.message,
      success: null,
      email: email || "",
      pageScript: "/js/verify-otp.js",
    });
  }
};

export const loadSetNewPassword = async (req, res) => {

  const { email } = req.query;

  // Extra security: check reset OTP exists
  const stored = await getResetOTP(email);

  if (!stored) {
    return res.redirect("/forgot-password");
  }

  res.render("user/set-new-password", {
    title: "Set New Password | BooksKart",
    headerType: "auth",
    email,
    errors: {},
    old: {},
    error: null,
    success: null,
    pageScript: "/js/set-new-password.js",
  });
};

export const setNewPassword = async (req, res) => {

  const { error, value } = setNewPasswordSchema.validate(req.body, {
    abortEarly: false
  });

  if (error) {

    const errors = {};
    error.details.forEach((err) => {
      errors[err.path[0]] = err.message;
    });

    return res.status(HTTP_STATUS.BAD_REQUEST).render(
      "user/set-new-password",
      {
        title: "Set New Password | BooksKart",
        headerType: "auth",
        email: req.body.email,
        errors,
        old: req.body,
        error: null,
        success: null,
        pageScript: "/js/set-new-password.js"
      }
    );
  }

  try {

    await setNewPasswordService(value.email, value.password);

    return res.redirect("/login");

  } catch (err) {

    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).render(
      "user/set-new-password",
      {
        title: "Set New Password | BooksKart",
        headerType: "auth",
        email: req.body.email,
        errors: {},
        old: req.body,
        error: err.message || "Something went wrong",
        success: null,
        pageScript: "/js/set-new-password.js"
      }
    );
  }
};

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
