/**
 * API Configuration
 * Centralized API configuration using environment variables
 */

// Use the actual hostname so the app works seamlessly from mobile devices on the same network
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL?.includes('localhost')
  ? `http://${window.location.hostname}:5000/api`
  : process.env.REACT_APP_API_BASE_URL || `http://${window.location.hostname}:5000/api`;

const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh-token`,
    GOOGLE_AUTH: `${API_BASE_URL}/auth/google`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
    VERIFY_OTP: `${API_BASE_URL}/auth/verify-otp`,
    VERIFY_EMAIL: `${API_BASE_URL}/auth/verify-email`,
    RESEND_VERIFY_OTP: `${API_BASE_URL}/auth/resend-verify-otp`,
    RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
  },

  // User endpoints
  USER: {
    PROFILE: `${API_BASE_URL}/users/profile`,
    UPDATE_PROFILE: `${API_BASE_URL}/users/profile`,
    UPLOAD_AVATAR: `${API_BASE_URL}/users/avatar`,
  },

  // Post endpoints
  POST: {
    GET_ALL: `${API_BASE_URL}/posts`,
    CREATE: `${API_BASE_URL}/posts`,
    GET_BY_ID: (id) => `${API_BASE_URL}/posts/${id}`,
    UPDATE: (id) => `${API_BASE_URL}/posts/${id}`,
    DELETE: (id) => `${API_BASE_URL}/posts/${id}`,
    LIKE: (id) => `${API_BASE_URL}/posts/${id}/like`,
    COMMENT: (id) => `${API_BASE_URL}/posts/${id}/comments`,
  },
};

export { API_BASE_URL, API_ENDPOINTS };
