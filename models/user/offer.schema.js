import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["percentage", "flat"],
      required: true
    },

    value: {
      type: Number,
      required: true,
      min: 1
    },

    expiryDate: {
      type: Date,
      required: true
    },

    targetType: {
      type: String,
      enum: ["category", "product"],
      required: true
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  },
  { timestamps: true }
);

const Offer = mongoose.model("Offer", offerSchema);

export default Offer;