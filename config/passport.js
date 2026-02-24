import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import * as authService from "../services/user/auth.service.js";
import User from "../models/user/userSchema.js";

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await authService.googleAuthService(profile);
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

export default passport;