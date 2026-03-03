import { profileService, updateProfileService } from "../../services/user/profile.service.js";
import { editProfileSchema } from "../../validators/user/profile.validator.js";

export const loadProfile = async (req, res, next) => {
  try {

    const profileData = await profileService(req.user);

    return res.render("user/profile", {
      title: "Profile | BooksKart",
      user: profileData,
      headerType: "main",
      success: null,
      error: null,
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

    return res.redirect("/profile");

  } catch (error) {

    // FIELD errors
    if (err.type === "FIELD") {
      return res.status(HTTP_STATUS.BAD_REQUEST).render("user/editProfile", {
        title: "Edit Profile | BooksKart",
        headerType: "main",
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
        errors: {},
        old: req.body,
        error: err.message,
        success: null,
        pageScript: "/js/editProfile.js",
      });
    }

    next(error);
  }
};