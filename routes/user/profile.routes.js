import express from "express";
import { isAuthenticated } from "../../middlewares/auth.middleware.js";

import { 
    addAddress, 
    changeEmail, 
    changePassword, 
    deleteAddress, 
    editAddress, 
    loadAddAddress, 
    loadAddressPage, 
    loadChangeEmail, 
    loadChangePassword, 
    loadEditAddress, 
    loadEditProfile, 
    loadProfile, 
    updateProfile 
} from "../../controllers/user/profile.controller.js";

import { uploadProfileImage } from "../../middlewares/upload.middleware.js";

const router = express.Router()

router.get('/', isAuthenticated, loadProfile)
router.get('/edit', isAuthenticated, loadEditProfile)
router.post('/edit', isAuthenticated, uploadProfileImage, updateProfile)
router.get('/change-password', isAuthenticated, loadChangePassword)
router.post('/change-password', isAuthenticated, changePassword)
router.get('/change-email', isAuthenticated, loadChangeEmail)
router.post('/change-email', isAuthenticated, changeEmail)


router.get('/address', isAuthenticated, loadAddressPage)
router.get('/address/add', isAuthenticated, loadAddAddress)
router.post('/address/add', isAuthenticated, addAddress)
router.get('/address/edit/:id', isAuthenticated, loadEditAddress)
router.post('/address/edit/:id', isAuthenticated, editAddress)
router.delete('/address/delete/:id', isAuthenticated, deleteAddress)

export default router