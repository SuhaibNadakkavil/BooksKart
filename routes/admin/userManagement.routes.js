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
router.patch('/users/:id/block', verifyAdminAuth, blockUser)
router.patch('/users/:id/unblock', verifyAdminAuth, unblockUser)
router.post('/logout', verifyAdminAuth, logout)

export default router