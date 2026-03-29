import mongoose from "mongoose";

const { Schema } = mongoose;

// =============================
// ORDER ITEM
// =============================
const orderItemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },

  title: { type: String, required: true },
  author: { type: String },

  variantType: { type: String, required: true },

  quantity: { type: Number, required: true },

  price: { type: Number, required: true },
  itemTotal: { type: Number, required: true },

  image: {
    type: String
  },

  status: {
    type: String,
    enum: [
      "pending",
      "shipped",
      "out_for_delivery",
      "delivered",
      "cancelled",
      "returned"
    ],
    default: "pending"
  },

  cancelReason: { type: String },
  returnReason: { type: String }

}, { _id: true });


// =============================
// ADDRESS SNAPSHOT
// =============================
const addressSchema = new Schema({
  name: String,
  street: String,
  city: String,
  state: String,
  pincode: String,
  phone: String
}, { _id: false });


// =============================
// ORDER
// =============================
const orderSchema = new Schema({

  orderId: {
    type: String,
    required: true,
    unique: true
  },

  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  items: [orderItemSchema],

  address: addressSchema,

  paymentMethod: {
    type: String,
    enum: ["cod", "razorpay", "wallet"],
    required: true
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending"
  },

  orderStatus: {
    type: String,
    enum: [
      "pending",
      "shipped",
      "out_for_delivery",
      "delivered",
      "cancelled"
    ],
    default: "pending"
  },

  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  shipping: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true }

}, {
  timestamps: true
});

export default mongoose.model("Order", orderSchema);