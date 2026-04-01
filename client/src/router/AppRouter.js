/**
 * SocialX - Application Router
 * Centralized routing configuration with lazy loading
 */

import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ROUTES } from '../config/constants';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

// Common Components
import { ProtectedRoute, PageLoader } from '../components/common';

// Lazy-loaded Pages
const Home = lazy(() => import('../pages/Home'));
const Login = lazy(() => import('../pages/Auth/Login'));
const Register = lazy(() => import('../pages/Auth/Register'));
const VerifyEmail = lazy(() => import('../pages/Auth/VerifyEmail'));
const ForgotPassword = lazy(() => import('../pages/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/Auth/ResetPassword'));
const AuthCallback = lazy(() => import('../pages/Auth/AuthCallback'));
const Feed = lazy(() => import('../pages/Feed'));
const CreatePost = lazy(() => import('../pages/CreatePost'));
const Profile = lazy(() => import('../pages/Profile'));
const Notifications = lazy(() => import('../pages/Notifications/Notifications'));

// Suspense wrapper for lazy-loaded components
const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

const router = createBrowserRouter([
  // Splash Screen (Landing)
  {
    path: ROUTES.HOME,
    element: (
      <SuspenseWrapper>
        <Home />
      </SuspenseWrapper>
    ),
  },

  // Auth Routes (light theme layout)
  {
    element: <AuthLayout />,
    children: [
      {
        path: ROUTES.LOGIN,
        element: (
          <SuspenseWrapper>
            <Login />
          </SuspenseWrapper>
        ),
      },
      {
        path: ROUTES.REGISTER,
        element: (
          <SuspenseWrapper>
            <Register />
          </SuspenseWrapper>
        ),
      },
      {
        path: ROUTES.VERIFY_EMAIL,
        element: (
          <SuspenseWrapper>
            <VerifyEmail />
          </SuspenseWrapper>
        ),
      },
      {
        path: ROUTES.FORGOT_PASSWORD,
        element: (
          <SuspenseWrapper>
            <ForgotPassword />
          </SuspenseWrapper>
        ),
      },
      {
        path: ROUTES.RESET_PASSWORD,
        element: (
          <SuspenseWrapper>
            <ResetPassword />
          </SuspenseWrapper>
        ),
      },
    ],
  },

  // Google OAuth Callback
  {
    path: '/auth/callback',
    element: (
      <SuspenseWrapper>
        <AuthCallback />
      </SuspenseWrapper>
    ),
  },

  // Protected Routes (require authentication)
  {
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: ROUTES.FEED,
        element: (
          <SuspenseWrapper>
            <Feed />
          </SuspenseWrapper>
        ),
      },
      {
        path: ROUTES.CREATE_POST,
        element: (
          <SuspenseWrapper>
            <CreatePost />
          </SuspenseWrapper>
        ),
      },
      {
        path: ROUTES.NOTIFICATIONS,
        element: (
          <SuspenseWrapper>
            <Notifications />
          </SuspenseWrapper>
        ),
      },
      {
        path: ROUTES.PROFILE,
        element: (
          <SuspenseWrapper>
            <Profile />
          </SuspenseWrapper>
        ),
      },
    ],
  },

  // Catch-all redirect
  {
    path: '*',
    element: <Navigate to={ROUTES.HOME} replace />,
  },
]);

export default router;
