import mongoose from "mongoose";

const { Schema } = mongoose;

const couponSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 30
    },

    discountPercent: {
      type: Number,
      required: true,
      min: 1,
      max: 90
    },

    minCartValue: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },

    maxDiscountAmount: {
      type: Number,
      default: 0,
      min: 0
    },

    maxUsageCount: {
      type: Number,
      default: 0,
      min: 0
    },

    usedCount: {
      type: Number,
      default: 0,
      min: 0
    },

    expiryDate: {
      type: Date,
      required: true
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
  {
    timestamps: true
  }
);

// // Auto uppercase code
// couponSchema.pre("save", function (next) {
//   if (this.code) {
//     this.code = this.code.toUpperCase().trim();
//   }
//   next();
// });

export default mongoose.model("Coupon", couponSchema);