import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {

    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        req.fileValidationError = "Only image files are allowed";
        cb(null, false);
    }

};

export const uploadProductImages = multer({
    storage,
    fileFilter,
    limits: { fileSize: 3 * 1024 * 1024 }
}).fields([
    { name: "coverImage", maxCount: 1 },
    { name: "sideImage", maxCount: 1 },
    { name: "backImage", maxCount: 1 }
]);