import Joi from "joi";

//signup validation

export const signupSchema = Joi.object({

  name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .pattern(/^[\p{L}]+(?:[ '-][\p{L}]+)*$/u)
    .required()
    .messages({
      "string.empty": "Name is required",
      "string.min": "Name must be at least 2 characters",
      "string.max": "Name must not exceed 50 characters",
      "string.pattern.base": "Enter a valid name",
    }),

  email: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/)
    .required()
    .messages({
      "string.empty": "Email is required",
      "string.pattern.base": "Enter a valid email address",
    }),

  phone: Joi.string()
    .trim()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      "string.empty": "Phone number is required",
      "string.pattern.base": "Enter a valid 10-digit phone number",
    }),

  referralCode: Joi.string()
    .trim()
    .max(20)
    .allow("")
    .optional(),

  password: Joi.string()
    .min(8)
    .max(100)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/)
    .required()
    .messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 8 characters",
      "string.pattern.base":
        "Must include uppercase, lowercase, number and special character",
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .messages({
      "any.only": "Passwords do not match",
      "string.empty": "Confirm password is required",
    }),

})
  .options({ abortEarly: false })
  .unknown(false);   

//login validation

export const loginSchema = Joi.object({

  email: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/)
    .required()
    .messages({
      "string.empty": "Email is required",
      "string.pattern.base": "Enter a valid email address",
    }),

  password: Joi.string()
    .min(8)
    .max(100)
    .required()
    .messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 8 characters",
    }),

})
  .options({ abortEarly: false })
  .unknown(false);

// Forgot Password Validation

export const forgotPasswordSchema = Joi.object({

  email: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/)
    .required()
    .messages({
      "string.empty": "Email is required",
      "string.pattern.base": "Enter a valid email address",
    }),

})
  .options({ abortEarly: false })
  .unknown(false);

// Set New Password Validation

export const setNewPasswordSchema = Joi.object({

  email: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/)
    .required()
    .messages({
      "string.empty": "Invalid request",
      "string.pattern.base": "Invalid request"
    }),

  password: Joi.string()
    .min(8)
    .max(100)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/)
    .required()
    .messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 8 characters",
      "string.pattern.base":
        "Must include uppercase, lowercase, number & special character"
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .messages({
      "any.only": "Passwords do not match",
      "string.empty": "Confirm password is required"
    })

})
.options({ abortEarly: false })
.unknown(false);