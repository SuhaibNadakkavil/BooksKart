import * as userRepo from '../repositories/user/user.repository.js'

export const isAuthenticated = async (req, res, next) => {
  try {

    if (!req.session || !req.session.userId) {
      return res.redirect('/login');
    }

    const user = await userRepo.findById(req.session.userId);

    if (!user) {
      req.session.destroy();
      return res.redirect('/login');
    }

    if (user.isBlocked) {
      req.session.destroy();
      return res.redirect('/login');
    }

    req.user = user;

    next();

  } catch (error) {
    next(error);
  }
};