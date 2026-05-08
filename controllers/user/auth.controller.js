import { 
  signupService, 
  loginService, 
  verifyResetOTPService, 
  forgotPasswordService, 
  setNewPasswordService 
} from "../../services/user/auth.service.js";

import { 
  signupSchema, 
  loginSchema, 
  forgotPasswordSchema, 
  setNewPasswordSchema 
} from "../../validators/user/auth.validator.js";

import HTTP_STATUS from "../../utils/httpStatus.js";

import { 
  deleteSignupOTP, 
  getSignupOTP, 
  resendSignupOTPService, 
  getResetOTP, 
  resendResetOTPService, 
  resendChangeEmailOTPService,
  getChangeEmailOTP,
  deleteChangeEmailOTP
} from "../../services/user/otp.service.js";

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

    req.session.success = "OTP Send successfully";

    req.session.pendingSignupEmail = result.email;

    return res.redirect("/verify-otp");

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
  if (req.session?.userId) {
    return res.redirect("/");
  }

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

  let email = null;

  const mode = req.query.mode || "signup";

  if (mode === "change-email") {
    email = req.session.pendingChangeEmail;
  } else {
    email = req.session.pendingSignupEmail;
  }

  const success = req.session.success || null;
  const error = req.session.error || null;

  delete req.session.success;
  delete req.session.error;

  let title = "Verify Email | BooksKart";
  let headerType = "auth";

  if (mode === "reset") {
    title = "Verify OTP | BooksKart";
  }

  if (mode === "change-email") {
    title = "Verify New Email | BooksKart";
    headerType = "main"; // user is logged in
  }

  res.render("user/verify-otp", {
    mode,
    title,
    headerType,
    error,
    success,
    email,
    pageScript: "/js/verify-otp.js",
  });
};

export const verifySignupOTP = async (req, res, next) => {
  try {

    const { email, otp, mode } = req.body;

    /* =========================================================
       CHANGE EMAIL MODE
    ========================================================= */

    if (mode === "change-email") {

      const storedData = await getChangeEmailOTP(email);

      if (!storedData || storedData.otp !== otp) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired OTP"
        });
      }

      await userRepo.updateUser(storedData.userId, {
        email,
        isVerified: true,
      });

      await deleteChangeEmailOTP(email);

      delete req.session.pendingChangeEmail;

      return res.status(200).json({
        success: true,
        message: "Email updated successfully",
        redirect: "/profile",
      });
    }

    /* =========================================================
       SIGNUP MODE (DEFAULT)
    ========================================================= */

    const storedData = await getSignupOTP(email);

    if (!storedData || storedData.otp !== otp) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired OTP"
        });
      }

    const user = await userRepo.createUser({
      ...storedData.userData,
      isVerified: true,
    });

    await deleteSignupOTP(email);

    delete req.session.pendingSignupEmail;

    req.session.regenerate((err) => {
      if (err) return next(err);

      req.session.userId = user._id;
      req.session.isAuthenticated = true;

      return res.status(200).json({
        success: true,
        message: "Authenticated",
        redirect: "/",
      });
    });

  } catch (error) {
    next(error);
  }
};

export const resendSignupOTP = async (req, res) => {
  try {

    const { email, mode } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    if (mode === "change-email") {
      await resendChangeEmailOTPService(email);
    } else {
      await resendSignupOTPService(email);
    }

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully",
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const googleCallback = async (req, res, next) => {
  try {

    if (!req.user) {
      req.session.error = "User not found";
      return res.redirect("/login");
    }

    req.session.regenerate((err) => {
      if (err) return next(err);

      req.session.userId = req.user._id;
      req.session.isAuthenticated = true;

      req.session.success = "Authenticated";
      return res.redirect("/");
    });

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

        req.session.regenerate((err) => {
          if (err) return next(err);

          req.session.userId = user._id;
          req.session.isAuthenticated = true;

          req.session.success = "Authenticated";
          return res.redirect("/");
        });
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
  if (req.session?.userId) {
    return res.redirect("/");
  }
  
  const success = req.session.success || null;
  const error = req.session.error || null;

  delete req.session.success;
  delete req.session.error;


  res.render("user/login", {
    title: "Login | BooksKart",
    headerType: "auth",
    error,
    success,
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

    req.session.success = "OTP Send successfully";

    req.session.pendingSignupEmail = normalizedEmail

    return res.redirect(`/verify-otp?mode=reset`);

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

  try {
  const { email, otp } = req.body;

  if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    await verifyResetOTPService(email, otp);

    req.session.pendingSignupEmail = email;

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      redirect: `/set-new-password`,
    });

  } catch (err) {

    return res.status(400).json({
      success: false,
      message: err.message || "Invalid OTP",
    });
  }
};

export const loadSetNewPassword = async (req, res) => {

  const email = req.session.pendingSignupEmail;

  // Extra security: check reset OTP exists
  const stored = await getResetOTP(email);

  if (!stored) {
    return res.redirect("/forgot-password");
  }

  const success = req.session.success || null;
  const error = req.session.error || null;

  delete req.session.success;
  delete req.session.error;

  res.render("user/set-new-password", {
    title: "Set New Password | BooksKart",
    headerType: "auth",
    email,
    errors: {},
    old: {},
    error,
    success,
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

    delete req.session.pendingSignupEmail;

    req.session.success = "Password changed successfully";
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
    delete req.session.userId;
    delete req.session.isAuthenticated;

    req.session.success = "Logged out successfully.";

    req.session.save((err) => {
      if (err) return next(err);

      res.clearCookie("user.sid");

      return res.redirect("/login");
    });
  } catch (error) {
    next(error);
  }
};
