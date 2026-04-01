/**
 * SocialX - Application Constants
 */

export const APP_NAME = process.env.REACT_APP_NAME || 'SocialX';
export const APP_VERSION = process.env.REACT_APP_VERSION || '0.1.0';

// Auth
export const TOKEN_KEY = 'socialx_access_token';
export const REFRESH_TOKEN_KEY = 'socialx_refresh_token';
export const USER_KEY = 'socialx_user';

// File Upload
export const MAX_FILE_SIZE = parseInt(process.env.REACT_APP_MAX_FILE_SIZE, 10) || 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const MAX_IMAGES_PER_POST = 4;

// Pagination
export const POSTS_PER_PAGE = 10;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_EMAIL: '/verify-email',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  FEED: '/feed',
  CREATE_POST: '/create-post',
  NOTIFICATIONS: '/notifications',
  PROFILE: '/profile',
  SETTINGS: '/settings',
};

// Animation Durations (seconds)
export const ANIMATION = {
  FAST: 0.2,
  NORMAL: 0.4,
  SLOW: 0.6,
  PAGE_TRANSITION: 0.5,
};

// Breakpoints (match MUI defaults)
export const BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
};
