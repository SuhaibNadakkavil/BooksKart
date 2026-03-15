import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["Paperback", "Hardcover"],
            required: true
        },

        regularPrice: {
            type: Number,
            required: true,
            min: 1
        },

        stock: {
            type: Number,
            default: 0,
            min: 0
        }

    },
    { _id: false }
);



const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },

        author: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            trim: true,
            required: true
        },

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },

        images: {
            cover: {
                type: String,
                required: true
            },
            side: {
                type: String,
                required: true
            },
            back: {
                type: String,
                required: true
            }
        },

        variants: {
            type: [variantSchema],
            validate: {
                validator: function (v) {
                    return v.length >= 1 && v.length <= 2;
                },
                message: "Product must have 1 or 2 variants"
            }
        },

        productOffer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Offer",
            default: null
        },

        isActive: {
            type: Boolean,
            default: true
        },

        isDeleted: {
            type: Boolean,
            default: false
        }

    },
    { timestamps: true }
);



const Product = mongoose.model("Product", productSchema);

export default Product;