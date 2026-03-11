import Joi from "joi";

const baseSchema = {

  type: Joi.string()
    .valid("percentage", "flat")
    .required()
    .messages({
      "any.only": "Invalid offer type",
      "string.empty": "Offer type is required"
    }),

  value: Joi.number()
    .required()
    .messages({
      "number.base": "Offer value must be a number",
      "any.required": "Offer value is required"
    }),

  expiry: Joi.date()
    .greater("now")
    .required()
    .messages({
      "date.base": "Invalid expiry date",
      "date.greater": "Expiry date must be a future date",
      "any.required": "Expiry date is required"
    })

};

export const addOfferSchema = Joi.object(baseSchema)
  .custom((value, helpers) => {

    if (value.type === "percentage") {

      if (value.value < 1 || value.value > 90) {
        return helpers.message("Percentage offer must be between 1% and 90%");
      }

    }

    if (value.type === "flat") {

      if (value.value < 1 || value.value > 10000) {
        return helpers.message("Flat offer must be between ₹1 and ₹10000");
      }

    }

    return value;

  });

export const updateOfferSchema = addOfferSchema;