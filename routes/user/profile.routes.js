import express from "express";
import { isAuthenticated } from "../../middlewares/auth.middleware.js";
import { loadEditProfile, loadProfile, updateProfile } from "../../controllers/user/profile.controller.js";
import { uploadProfileImage } from "../../middlewares/upload.middleware.js";

const router = express.Router()

router.get('/', isAuthenticated, loadProfile)
router.get('/edit', isAuthenticated, loadEditProfile)
router.post('/edit', isAuthenticated, uploadProfileImage.single('profileImage'), updateProfile)

export default router