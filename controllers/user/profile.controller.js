import { profileService } from "../../services/user/profile.service.js";

export const loadProfile = async (req, res, next) => {
  try {

    const profileData = await profileService(req.user);

    return res.render("user/profile", {
      title: "Profile | BooksKart",
      user: profileData,
      headerType: "main",
      success: null,
      error: null,
      pageScript: '/js/profile.js',
    });

  } catch (error) {
    next(error);
  }
};