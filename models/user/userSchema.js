import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    phone: {
      type: String,
      default: null,
      unique: true,
      trim: true,
      sparse: true,
    },

    password: {
      type: String,
      default: null,
      select: false,
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local"
    },

    referralCode: {
      type: String,
      trim: true,
      default: null,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isBlocked: {
      type: Boolean,
      default: false,
      index: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);


const User = mongoose.model("User", userSchema);

export default User