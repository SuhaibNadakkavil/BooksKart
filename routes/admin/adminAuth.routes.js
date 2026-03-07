import express from "express";
import { 
    loadLoginPage, 
    login 
} from "../../controllers/admin/adminAuth.controller.js";

const router = express.Router()

router.get('/login', loadLoginPage)
router.post('/login', login)

export default router