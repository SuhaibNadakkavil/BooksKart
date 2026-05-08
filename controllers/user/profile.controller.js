import { 
  changeEmailService, 
  changePasswordService, 
  profileService, 
  updateProfileService 
} from "../../services/user/profile.service.js";

import { 
  changeEmailSchema, 
  changePasswordSchema, 
  editProfileSchema 
} from "../../validators/user/profile.validator.js";

import HTTP_STATUS from "../../utils/httpStatus.js";

import { 
  addAddressService, 
  deleteAddressService, 
  editAddressService, 
  getUserAddressesService 
} from "../../services/user/address.service.js";

import { addressSchema } from "../../validators/user/address.validator.js";
import * as addressRepo from '../../repositories/user/address.repo.js'

export const loadProfile = async (req, res, next) => {
  try {

    const profileData = await profileService(req.user);

    const success = req.session.success || null;
    const error = req.session.error || null;

    delete req.session.success;
    delete req.session.error;

    return res.render("user/profile", {
      title: "Profile | BooksKart",
      activePage: 'profile',
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

  if (req.fileValidationError) {
    return res.status(400).render("user/editProfile", {
      title: "Edit Profile | BooksKart",
      headerType: "main",
      errors: {},
      old: req.body,
      error: req.fileValidationError,
      success: null,
      pageScript: "/js/editProfile.js",
    });
  }

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
      updateData.profileImage = req.file.path;
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

    req.session.pendingChangeEmail = value.newEmail;

    return res.redirect(`/verify-otp?mode=change-email`);

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


export const loadAddressPage = async (req, res, next) => {
  try {

    const success = req.session.success || null;
    const error = req.session.error || null;

    delete req.session.success;
    delete req.session.error;

    // later you will fetch addresses
    const addresses = await getUserAddressesService(req.user._id);

    res.render("user/address", {
      title: "Address | BooksKart",
      activePage: 'address',
      headerType: "main",
      addresses,
      success,
      error,
      pageScript: "/js/profile.js"
    });

  } catch (error) {
    next(error);
  }
};


export const loadAddAddress = async (req, res, next) => {
  try {

    res.render("user/addAddress", {
      title: "Add Address | BooksKart",
      headerType: "main",
      errors: {},
      old: {},
      success: null,
      error: null,
      pageScript: '/js/addAddress.js'
    });

  } catch (error) {
    next(error);
  }
};


export const addAddress = async (req, res, next) => {

  req.body.isDefault = req.body.isDefault === 'true'

  const { error, value } = addressSchema.validate(req.body, {
    abortEarly: false
  });

  if (error) {

    const errors = {};

    error.details.forEach((err) => {
      errors[err.path[0]] = err.message;
    });

    return res.status(HTTP_STATUS.BAD_REQUEST).render(
      "user/addAddress",
      {
        title: "Add Address | BooksKart",
        headerType: "main",
        errors,
        old: req.body,
        error: null,
        success: null,
        pageScript: '/js/addAddress.js',
      }
    );
  }

  try {

    await addAddressService(req.user._id,value);

    req.session.success = "Address added successfully";

    return res.redirect("/profile/address");

  } catch (err) {

    if (err.type === "GLOBAL") {

      return res.status(HTTP_STATUS.BAD_REQUEST).render("user/addAddress", {
        title: "Add Address | BooksKart",
        headerType: "main",
        errors: {},
        old: req.body,
        error: err.message,
        success: null,
        pageScript: "/js/addAddress.js"
      });

    }

    next(err);
  }
};


export const loadEditAddress = async (req, res, next) => {
  try {

    const { id } = req.params;

    const success = req.session.success || null;
    const error = req.session.error || null;

    delete req.session.success;
    delete req.session.error;

    const address = await addressRepo.getAddressById(req.user._id, id);

    if (!address || address.userId.toString() !== req.user._id.toString()) {
      req.session.error = "Address not found";
      return res.redirect("/profile/address");
    }

    res.render("user/editAddress", {
      title: "Edit Address | BooksKart",
      headerType: "main",
      address,
      errors: {},
      old: {},
      success,
      error,
      pageScript: "/js/editAddress.js"
    });

  } catch (error) {
    next(error);
  }
};


export const editAddress = async (req, res, next) => {

  const { id } = req.params;

  req.body.isDefault = req.body.isDefault === "true";

  const { error, value } = addressSchema.validate(req.body, {
    abortEarly: false
  });

  if (error) {

    const errors = {};

    error.details.forEach(err => {
      errors[err.path[0]] = err.message;
    });

    return res.status(HTTP_STATUS.BAD_REQUEST).render(
      "user/editAddress",
      {
        title: "Edit Address | BooksKart",
        headerType: "main",
        errors,
        old: req.body,
        address: { _id: id },
        success: null,
        error: null,
        pageScript: "/js/editAddress.js"
      }
    );
  }

  try {

    await editAddressService(req.user._id, id, value);

    req.session.success = "Address updated successfully";

    return res.redirect("/profile/address");

  } catch (err) {

    if (err.type === "GLOBAL") {

      return res.status(HTTP_STATUS.BAD_REQUEST).render(
        "user/editAddress",
        {
          title: "Edit Address | BooksKart",
          headerType: "main",
          errors: {},
          old: req.body,
          address: { _id: id },
          success: null,
          error: err.message,
          pageScript: "/js/editAddress.js"
        }
      );

    }

    next(err);
  }

};

export const deleteAddress = async (req, res, next) => {

  try {

    const { id } = req.params;

    await deleteAddressService(req.user._id, id);

    return res.json({
      success: true,
      message: "Address deleted successfully"
    });

  } catch (err) {

    return res.status(400).json({
      success: false,
      message: err.message
    });

  }

};