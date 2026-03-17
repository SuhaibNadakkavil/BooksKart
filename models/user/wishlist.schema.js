import mongoose from "mongoose";

const wishlistItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },

    variantType: {
      type: String,
      enum: ["Paperback", "Hardcover"],
      required: true
    },

    addedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);


const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    items: [wishlistItemSchema]

  },
  {
    timestamps: true
  }
);

export default mongoose.model("Wishlist", wishlistSchema);