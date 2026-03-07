import express from "express";
import { verifyAdminAuth } from '../../middlewares/adminAuth.middleware.js'
import { 
    blockUser, 
    loadUserManagement, 
    logout, 
    unblockUser 
} from "../../controllers/admin/userManagement.controller.js";

const router = express.Router()

router.get('/users', verifyAdminAuth, loadUserManagement)
router.get('/users/block/:id', verifyAdminAuth, blockUser)
router.get('/users/unblock/:id', verifyAdminAuth, unblockUser)
router.post('/logout', verifyAdminAuth, logout)

export default router