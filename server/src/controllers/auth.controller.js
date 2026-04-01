/**
 * SocialX - Auth Controller
 * Handles registration, login, Google OAuth, password reset
 */

const User = require('../models/User');
const { generateTokens, verifyRefreshToken } = require('../utils/tokens');
const { sendOtpEmail, sendVerificationOtpEmail } = require('../utils/email');
const validator = require('validator');

// ==========================================
// Register (Email & Password)
// ==========================================
exports.register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and password are required.',
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.',
      });
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one uppercase, one lowercase, one number, and one special character.',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Create user (NOT verified yet)
    const user = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password,
      isEmailVerified: false,
    });

    // Generate email verification OTP
    const otp = user.generateEmailVerifyOtp();
    await user.save();

    // Send verification OTP email
    try {
      await sendVerificationOtpEmail(user.email, otp, user.fullName);
    } catch (emailError) {
      console.error('Verification email failed:', emailError);
      // Still created the user, but let them know email failed
    }

    res.status(201).json({
      success: true,
      message: 'Account created! Please verify your email with the OTP sent.',
    });
  } catch (error) {
    console.error('Register error:', error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
    });
  }
};

// ==========================================
// Login (Email & Password)
// ==========================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    // Find user (include password field)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check if user has a password (could be Google-only account)
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: 'This account uses Google Sign-In. Please use Google to log in.',
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated.',
      });
    }

    // Check email verification
    if (!user.isEmailVerified) {
      // Resend verification OTP
      const otp = user.generateEmailVerifyOtp();
      await user.save();
      try {
        await sendVerificationOtpEmail(user.email, otp, user.fullName);
      } catch (emailError) {
        console.error('Verification email failed:', emailError);
      }
      return res.status(403).json({
        success: false,
        message: 'Email not verified. A new OTP has been sent to your email.',
        code: 'EMAIL_NOT_VERIFIED',
        email: user.email,
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Store refresh token (keep max 5)
    user.refreshTokens.push({ token: refreshToken });
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      user: user.toPublicProfile(),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
    });
  }
};

// ==========================================
// Google OAuth Callback
// ==========================================
exports.googleCallback = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Store refresh token
    user.refreshTokens.push({ token: refreshToken });
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }
    user.lastLogin = new Date();
    await user.save();

    // Redirect to client with tokens (using URL query parameters for guaranteed cross-browser delivery)
    const redirectUrl = `${process.env.CLIENT_URL}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}&user=${encodeURIComponent(JSON.stringify(user.toPublicProfile()))}`;

    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
  }
};

// ==========================================
// Refresh Token
// ==========================================
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required.',
      });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token.',
      });
    }

    // Find user and check if refresh token exists
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found.',
      });
    }

    const tokenExists = user.refreshTokens.some((rt) => rt.token === refreshToken);
    if (!tokenExists) {
      // Possible token reuse — clear all refresh tokens (security measure)
      user.refreshTokens = [];
      await user.save();
      return res.status(401).json({
        success: false,
        message: 'Reuse detected. All sessions invalidated.',
      });
    }

    // Remove old refresh token
    user.refreshTokens = user.refreshTokens.filter((rt) => rt.token !== refreshToken);

    // Generate new tokens
    const tokens = generateTokens(user._id);

    // Store new refresh token
    user.refreshTokens.push({ token: tokens.refreshToken });
    await user.save();

    res.status(200).json({
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Token refresh failed.',
    });
  }
};

// ==========================================
// Forgot Password (Send OTP)
// ==========================================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Don't reveal if user exists (security best practice)
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account with this email exists, an OTP has been sent.',
      });
    }

    // Generate OTP
    const otp = user.generateResetOtp();
    await user.save();

    // Send OTP email
    try {
      await sendOtpEmail(user.email, otp, user.fullName);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      user.clearResetOtp();
      await user.save();
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'If an account with this email exists, an OTP has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process request.',
    });
  }
};

// ==========================================
// Verify OTP
// ==========================================
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP.',
      });
    }

    const isValid = user.verifyResetOtp(otp);
    await user.save(); // Save updated attempts

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully.',
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'OTP verification failed.',
    });
  }
};

// ==========================================
// Verify Email (after registration)
// ==========================================
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP.',
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified.',
      });
    }

    const isValid = user.verifyEmailOtp(otp);
    if (!isValid) {
      await user.save();
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP.',
      });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.clearEmailVerifyOtp();

    // Generate tokens and log user in
    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshTokens.push({ token: refreshToken });
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully!',
      user: user.toPublicProfile(),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      message: 'Email verification failed.',
    });
  }
};

// ==========================================
// Resend Email Verification OTP
// ==========================================
exports.resendVerifyOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists, a new OTP has been sent.',
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified.',
      });
    }

    const otp = user.generateEmailVerifyOtp();
    await user.save();

    try {
      await sendVerificationOtpEmail(user.email, otp, user.fullName);
    } catch (emailError) {
      console.error('Resend verification email failed:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'A new verification OTP has been sent.',
    });
  } catch (error) {
    console.error('Resend verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP.',
    });
  }
};

// ==========================================
// Reset Password
// ==========================================
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and new password are required.',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request.',
      });
    }

    // Verify OTP
    const isValid = user.verifyResetOtp(otp);
    if (!isValid) {
      await user.save();
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP.',
      });
    }

    // Update password
    user.password = newPassword;
    user.clearResetOtp();
    // Invalidate all refresh tokens (security)
    user.refreshTokens = [];
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. Please login with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed.',
    });
  }
};

// ==========================================
// Logout
// ==========================================
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (req.user && refreshToken) {
      // Remove the specific refresh token
      req.user.refreshTokens = req.user.refreshTokens.filter(
        (rt) => rt.token !== refreshToken
      );
      await req.user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(200).json({
      success: true,
      message: 'Logged out.',
    });
  }
};
