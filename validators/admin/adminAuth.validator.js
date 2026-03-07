import Joi from "joi";

export const adminLoginSchema = Joi.object({

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