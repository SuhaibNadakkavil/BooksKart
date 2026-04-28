import mongoose from "mongoose";

const { Schema } = mongoose;

// ==============================
// TRANSACTION
// ==============================
const transactionSchema = new Schema(
  {
    type: {
      type: String,
      enum: [
        "credit",   // add money / refund
        "debit"     // purchase
      ],
      required: true
    },

    source: {
      type: String,
      enum: [
        "topup",        // user added money
        "refund",       // order refund
        "purchase",     // paid using wallet
        "referral",    
        "adjustment"    // admin/manual future use
      ],
      required: true
    },

    amount: {
      type: Number,
      required: true,
      min: 1
    },

    description: {
      type: String,
      trim: true,
      default: ""
    },

    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "success"
    },

    referenceId: {
      type: String,
      default: null
    },

    razorpayOrderId: {
      type: String,
      default: null
    },

    razorpayPaymentId: {
      type: String,
      default: null
    }
  },
  { timestamps: true, _id: true }
);

// ==============================
// WALLET
// ==============================
const walletSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    balance: {
      type: Number,
      default: 0,
      min: 0
    },

    totalCredited: {
      type: Number,
      default: 0
    },

    totalDebited: {
      type: Number,
      default: 0
    },

    transactions: [transactionSchema]
  },
  { timestamps: true }
);

export default mongoose.model("Wallet", walletSchema);