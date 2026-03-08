import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "bookskart/profile",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],

    transformation: [
      {
        width: 400,
        height: 400,
        crop: "fill",
        gravity: "face"
      }
    ]
  }
});

const fileFilter = (req, file, cb) => {

  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    req.fileValidationError = "Only image files are allowed";
    cb(null, false);
  }

};

export const uploadProfileImage = multer({
  storage: profileStorage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }
}).single("profileImage");