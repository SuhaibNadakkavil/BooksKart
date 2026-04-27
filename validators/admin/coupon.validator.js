import Joi from "joi";

export const couponSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required(),

  code: Joi.string()
    .trim()
    .alphanum()
    .min(3)
    .max(30)
    .required(),

  discountPercent: Joi.number()
    .min(1)
    .max(90)
    .required(),

  minCartValue: Joi.number()
    .min(0)
    .required(),

    maxDiscountAmount: Joi.number()
    .min(0),

    maxUsageCount: Joi.number()
    .min(0),

  expiryDate: Joi.date()
    .required()
});