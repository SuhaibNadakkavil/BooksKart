import { changeEmailService, changePasswordService, profileService, updateProfileService } from "../../services/user/profile.service.js";
import { changeEmailSchema, changePasswordSchema, editProfileSchema } from "../../validators/user/profile.validator.js";
import HTTP_STATUS from "../../utils/httpStatus.js";

export const loadProfile = async (req, res, next) => {
  try {

    const profileData = await profileService(req.user);

    const success = req.session.success || null;
    const error = req.session.error || null;

    delete req.session.success;
    delete req.session.error;

    return res.render("user/profile", {
      title: "Profile | BooksKart",
      user: profileData,
      headerType: "main",
      success,
      error,
      pageScript: '/js/profile.js',
    });

  } catch (error) {
    next(error);
  }
};

export const loadEditProfile = async (req, res, next) => {
  try {

    const profileData = await profileService(req.user);

    return res.render("user/editProfile", {
      title: "Edit Profile | BooksKart",
      user: profileData,
      headerType: "main",
      success: null,
      error: null,
      errors: {},
      old: {},
      pageScript: "/js/editProfile.js"
    });

  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {

    const { error, value } = editProfileSchema.validate(req.body, {
      abortEarly: false,
    });

    // Joi validation errors
    if (error) {
      const errors = {};

      error.details.forEach((err) => {
        errors[err.path[0]] = err.message;
      });

      return res.status(HTTP_STATUS.BAD_REQUEST).render("user/editProfile", {
        title: "Edit Profile | BooksKart",
        headerType: "main",
        errors,
        old: req.body,
        error: null,
        success: null,
        pageScript: "/js/editProfile.js",
      });
    }

    let updateData = {
      name: value.name,
      phone: value.phone || null,
    };

    if (req.file) {
      updateData.profileImage = `/uploads/profile/${req.file.filename}`;
    }

    await updateProfileService(req.user._id, updateData);

    req.session.success = "Profile updated successfully";
    return res.redirect("/profile");

  } catch (err) {

    const profileData = await profileService(req.user);
    // FIELD errors
    if (err.type === "FIELD") {
      return res.status(HTTP_STATUS.BAD_REQUEST).render("user/editProfile", {
        title: "Edit Profile | BooksKart",
        headerType: "main",
        user: profileData,
        errors: { [err.field]: err.message },
        old: req.body,
        error: null,
        success: null,
        pageScript: "/js/editProfile.js",
      });
    }

    // GLOBAL errors
    if (err.type === "GLOBAL") {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).render("user/editProfile", {
        title: "Edit Profile | BooksKart",
        headerType: "main",
        user: profileData,
        errors: {},
        old: req.body,
        error: err.message,
        success: null,
        pageScript: "/js/editProfile.js",
      });
    }

    next(err);
  }
};

export const loadChangePassword = async (req, res, next) => {
  try {
    return res.render("user/changePassword", {
      title: "Change Password | BooksKart",
      headerType: "main",
      errors: {},
      error: null,
      success: null,
      pageScript: "/js/changePassword.js",
    });
  } catch (error) {
    next(error);
  }
};


export const changePassword = async (req, res, next) => {

  const { error, value } = changePasswordSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    const errors = {};
    error.details.forEach((err) => {
      errors[err.path[0]] = err.message;
    });

    return res.status(HTTP_STATUS.BAD_REQUEST).render(
      "user/changePassword",
      {
        title: "Change Password | BooksKart",
        headerType: "main",
        errors,
        error: null,
        success: null,
        pageScript: "/js/changePassword.js",
      }
    );
  }

  try {

    await changePasswordService(
      req.user._id,
      value.currentPassword,
      value.newPassword
    );

    req.session.success = "Password changed successfully";
    return res.redirect("/profile");

  } catch (err) {

    if (err.type === "FIELD") {
      return res.status(HTTP_STATUS.BAD_REQUEST).render(
        "user/changePassword",
        {
          title: "Change Password | BooksKart",
          headerType: "main",
          errors: { [err.field]: err.message },
          error: null,
          success: null,
          pageScript: "/js/changePassword.js",
        }
      );
    }

    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).render(
      "user/changePassword",
      {
        title: "Change Password | BooksKart",
        headerType: "main",
        errors: {},
        success: null,
        error: err.message || "Something went wrong",
        pageScript: "/js/changePassword.js",
      }
    );
  }
};


export const loadChangeEmail = async (req, res, next) => {
  try {

    const profileData = await profileService(req.user);

    return res.render("user/changeEmail", {
      title: "Change Email | BooksKart",
      headerType: "main",
      user: profileData,
      errors: {},
      old: {},
      error: null,
      success: null,
      pageScript: "/js/changeEmail.js",
    });

  } catch (error) {
    next(error);
  }
};


export const changeEmail = async (req, res, next) => {

  const { error, value } = changeEmailSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    const errors = {};
    error.details.forEach((err) => {
      errors[err.path[0]] = err.message;
    });

    return res.status(HTTP_STATUS.BAD_REQUEST).render(
      "user/changeEmail",
      {
        title: "Change Email | BooksKart",
        headerType: "main",
        user: req.user,
        errors,
        old: req.body,
        error: null,
        success: null,
        pageScript: "/js/changeEmail.js",
      }
    );
  }

  try {

    await changeEmailService(
      req.user._id,
      value.newEmail
    );

    req.session.success = "OTP sent to your new email";

    return res.redirect(
      `/verify-otp?mode=change-email&email=${value.newEmail}`
    );

  } catch (err) {

    if (err.type === "FIELD") {
      return res.status(HTTP_STATUS.BAD_REQUEST).render(
        "user/changeEmail",
        {
          title: "Change Email | BooksKart",
          headerType: "main",
          user: req.user,
          errors: { [err.field]: err.message },
          old: req.body,
          error: null,
          success: null,
          pageScript: "/js/changeEmail.js",
        }
      );
    }

    next(err);
  }
};