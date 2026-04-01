/**
 * SocialX - Auth Service
 * API calls for authentication (login, register, OAuth, password reset)
 */

import axiosInstance from '../utils/axiosInstance';
import { API_ENDPOINTS } from '../config/api';

const authService = {
  /**
   * Login with email and password
   */
  login: async (email, password) => {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
    return response.data;
  },

  /**
   * Register a new account
   */
  register: async (userData) => {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    return response.data;
  },

  /**
   * Google OAuth2 login
   */
  googleAuth: async (tokenId) => {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.GOOGLE_AUTH, { tokenId });
    return response.data;
  },

  /**
   * Request password reset OTP
   */
  forgotPassword: async (email) => {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    return response.data;
  },

  /**
   * Verify OTP (password reset)
   */
  verifyOtp: async (email, otp) => {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.VERIFY_OTP, { email, otp });
    return response.data;
  },

  /**
   * Verify email with OTP (after registration)
   */
  verifyEmail: async (email, otp) => {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { email, otp });
    return response.data;
  },

  /**
   * Resend email verification OTP
   */
  resendVerifyOtp: async (email) => {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.RESEND_VERIFY_OTP, { email });
    return response.data;
  },

  /**
   * Reset password with verified OTP token
   */
  resetPassword: async (email, otp, newPassword) => {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      email,
      otp,
      newPassword,
    });
    return response.data;
  },

  /**
   * Logout
   */
  logout: async () => {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT);
    return response.data;
  },
};

export default authService;
