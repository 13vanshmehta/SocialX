/**
 * SocialX - Auth Routes
 */

const express = require('express');
const passport = require('passport');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authenticate = require('../middleware/authenticate');

// Email & Password
router.post('/register', authController.register);
router.post('/login', authController.login);

// Token Refresh
router.post('/refresh-token', authController.refreshToken);

// Password Reset
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOtp);
router.post('/reset-password', authController.resetPassword);

// Email Verification (after registration)
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verify-otp', authController.resendVerifyOtp);

// Logout (requires auth to identify user)
router.post('/logout', authenticate, authController.logout);

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user, info) => {
      if (err) {
        console.error('🚨 Google OAuth Internal Error:', err.message || err);
        // If it's an OAuth2 strategy error, err might have an internal property
        if (err.oauthError) {
           console.error('Google OAuth Details:', err.oauthError);
        }
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=auth_failed`);
      }
      if (!user) {
        console.error('🚨 Google OAuth User Not Found. Info:', info);
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=auth_failed`);
      }
      
      // Success
      req.user = user;
      next();
    })(req, res, next);
  },
  authController.googleCallback
);

module.exports = router;
