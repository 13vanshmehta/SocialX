/**
 * SocialX - User Model
 * MongoDB schema for user accounts
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: 'Please provide a valid email',
      },
    },
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't return password in queries by default
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
    },
    bio: {
      type: String,
      maxlength: [150, 'Bio cannot exceed 150 characters'],
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    googleId: {
      type: String,
      default: null,
      sparse: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    // OTP for password reset
    resetOtp: {
      code: { type: String, default: null },
      expiresAt: { type: Date, default: null },
      attempts: { type: Number, default: 0 },
    },
    // OTP for email verification (after registration)
    emailVerifyOtp: {
      code: { type: String, default: null },
      expiresAt: { type: Date, default: null },
      attempts: { type: Number, default: 0 },
    },
    // Refresh tokens (store hashed)
    refreshTokens: [{
      token: { type: String },
      createdAt: { type: Date, default: Date.now },
    }],
    lastLogin: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    subscribers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    subscribedTo: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.resetOtp;
        delete ret.emailVerifyOtp;
        return ret;
      },
    },
  }
);

// Indexes are automatically created by unique: true and sparse: true

// ==========================================
// Pre-save middleware — hash password
// ==========================================
userSchema.pre('save', async function (next) {
  // Only hash if password is modified
  if (!this.isModified('password') || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ==========================================
// Instance Methods
// ==========================================

/**
 * Compare entered password with hashed password
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Generate OTP for password reset
 */
userSchema.methods.generateResetOtp = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.resetOtp = {
    code: otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    attempts: 0,
  };
  return otp;
};

/**
 * Verify reset OTP
 */
userSchema.methods.verifyResetOtp = function (candidateOtp) {
  if (!this.resetOtp.code) return false;
  if (this.resetOtp.expiresAt < new Date()) return false;
  if (this.resetOtp.attempts >= 5) return false;

  this.resetOtp.attempts += 1;

  return this.resetOtp.code === candidateOtp;
};

/**
 * Clear reset OTP
 */
userSchema.methods.clearResetOtp = function () {
  this.resetOtp = { code: null, expiresAt: null, attempts: 0 };
};

/**
 * Generate OTP for email verification
 */
userSchema.methods.generateEmailVerifyOtp = function () {
  const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit
  this.emailVerifyOtp = {
    code: otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    attempts: 0,
  };
  return otp;
};

/**
 * Verify email OTP
 */
userSchema.methods.verifyEmailOtp = function (candidateOtp) {
  if (!this.emailVerifyOtp.code) return false;
  if (this.emailVerifyOtp.expiresAt < new Date()) return false;
  if (this.emailVerifyOtp.attempts >= 5) return false;
  this.emailVerifyOtp.attempts += 1;
  return this.emailVerifyOtp.code === candidateOtp;
};

/**
 * Clear email verify OTP
 */
userSchema.methods.clearEmailVerifyOtp = function () {
  this.emailVerifyOtp = { code: null, expiresAt: null, attempts: 0 };
};

/**
 * Get public profile data
 */
userSchema.methods.toPublicProfile = function () {
  return {
    id: this._id,
    fullName: this.fullName,
    username: this.username || this.email.split('@')[0],
    email: this.email,
    avatar: this.avatar,
    bio: this.bio,
    isEmailVerified: this.isEmailVerified,
    createdAt: this.createdAt,
    subscribedTo: this.subscribedTo || [],
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User;
