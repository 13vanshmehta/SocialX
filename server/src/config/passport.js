/**
 * SocialX - Passport Configuration
 * Google OAuth2 Strategy
 */

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

module.exports = (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists with this Google ID
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            return done(null, user);
          }

          // Check if user exists with the same email (registered via email/password)
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // Link Google account to existing user
            user.googleId = profile.id;
            if (!user.avatar && profile.photos[0]) {
              user.avatar = profile.photos[0].value;
            }
            
            // Per user request, Google authentication inherently verifies the email.
            // So if they previously registered via email but hadn't done OTP verification, this verifies them.
            if (!user.isEmailVerified) {
              user.isEmailVerified = true;
            }
            
            await user.save();
            return done(null, user);
          }

          // Create new user from Google profile
          user = await User.create({
            googleId: profile.id,
            fullName: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos[0]?.value || '',
            isEmailVerified: true, // Google emails are already verified
          });

          done(null, user);
        } catch (error) {
          console.error('Google OAuth Strategy Error:', error);
          done(error, null);
        }
      }
    )
  );

  // Serialize user for session (not used with JWT, but passport requires it)
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};
