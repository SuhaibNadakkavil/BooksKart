import mongoose from "mongoose";
import './offer.schema.js'

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
    },

    description: {
      type: String,
      trim: true
    },

    isActive: {
      type: Boolean,
      default: true
    },

    isDeleted: {
      type: Boolean,
      default: false
    },

    offer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offer",
      default: null
    }
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);

export default Category;