import Joi from "joi";


const variantSchema = Joi.object({

    type: Joi.string()
        .valid("Paperback", "Hardcover")
        .required()
        .messages({
            "any.only": "Invalid variant type"
        }),

    regularPrice: Joi.number()
        .min(1)
        .required()
        .messages({
            "number.base": "Regular price must be a number",
            "number.min": "Price must be greater than 0"
        }),

    stock: Joi.number()
        .min(0)
        .required()
        .messages({
            "number.base": "Stock must be a number",
            "number.min": "Stock cannot be negative"
        })

});



export const createProductSchema = Joi.object({

    title: Joi.string()
        .trim()
        .min(2)
        .max(150)
        .required()
        .messages({
            "string.empty": "Product title is required"
        }),

    author: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
            "string.empty": "Author name is required"
        }),

    description: Joi.string()
        .trim()
        .min(10)
        .max(2000)
        .required()
        .messages({
            "string.empty": "Description is required"
        }),

    category: Joi.string()
        .required()
        .messages({
            "string.empty": "Category is required"
        }),

    variants: Joi.array()
        .items(variantSchema)
        .min(1)
        .max(2)
        .custom((value, helpers) => {

            const types = value.map(v => v.type);

            if (new Set(types).size !== types.length) {
                return helpers.error("any.invalid");
            }

            return value;

        })
        .messages({
            "array.min": "At least one variant required",
            "array.max": "Maximum two variants allowed",
            "any.invalid": "Duplicate variant types not allowed"
        }),

    images: Joi.object({

        cover: Joi.string().required(),
        side: Joi.string().required(),
        back: Joi.string().required()

    })

});