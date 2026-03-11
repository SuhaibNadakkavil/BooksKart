import Joi from "joi";

export const createCategorySchema = Joi.object({

  name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      "string.empty": "Category name is required",
      "string.min": "Category name must be at least 2 characters",
      "string.max": "Category name must be less than 50 characters"
    }),

  description: Joi.string()
    .trim()
    .min(3)
    .max(200)
    .required()
    .messages({
      "string.empty": "Description is required"
    }),

  status: Joi.any()

});


export const updateCategorySchema = Joi.object({

  name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required(),

  description: Joi.string()
    .trim()
    .min(3)
    .max(200)
    .required(),

  status: Joi.any()

});