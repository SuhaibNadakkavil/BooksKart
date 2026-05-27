import * as userRepo from "../repositories/user/user.repository.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.redirect("/login");
    }

    const user = await userRepo.findById(req.session.userId);

    // Invalid user
    if (!user) {
      req.session.error = "Session expired. Please login again.";

      delete req.session.userId;
      delete req.session.isAuthenticated;

      return res.redirect("/login");
    }

    // Blocked user
    if (user.isBlocked) {
      req.session.error = "Your account has been blocked.";

      delete req.session.userId;
      delete req.session.isAuthenticated;

      return res.redirect("/login");
    }

    req.user = user;

    const allowedRoutes = [
      "/referral-onboarding",
      "/logout",
    ];

    if (
      !user.isReferralStepCompleted &&
      user.authProvider === "google" &&
      !allowedRoutes.includes(req.path)
    ) {
      return res.redirect(
        "/referral-onboarding"
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};