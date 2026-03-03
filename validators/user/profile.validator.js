import Joi from "joi";

export const editProfileSchema = Joi.object({

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

  phone: Joi.string()
    .trim()
    .pattern(/^[6-9]\d{9}$/)
    .allow("")
    .optional()
    .messages({
      "string.pattern.base": "Enter a valid 10-digit phone number",
    }),

})
.options({ abortEarly: false })
.unknown(false);