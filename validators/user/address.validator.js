import Joi from "joi";

export const addressSchema = Joi.object({

  name: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
      "string.empty": "Name is required"
    }),

  street: Joi.string()
    .min(5)
    .required()
    .messages({
      "string.empty": "Address line is required"
    }),

  city: Joi.string()
    .required(),

  state: Joi.string()
    .required(),

  pincode: Joi.string()
    .pattern(/^[0-9]{5,6}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid postal code"
    }),

  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid phone number"
    }),

  isDefault: Joi.boolean()
});