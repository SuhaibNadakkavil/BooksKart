import * as userRepo from '../repositories/user.repository.js'
import HTTP_STATUS from '../utils/httpStatus.js'

export const isAuthenticated = async (req, res, next) => {
    try {

        if(!req.session || !req.session.userId){
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: "Authentication required",
            });
        }

        const user = await userRepo.findById(req.session.userId);

        if (!user) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: "User not found",
            });
        }

        if (user.isBlocked) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                message: "Your account has been blocked",
            });
        }

    
        req.user = user;

        next();

    } catch (error) {
        next(error)
    }
}