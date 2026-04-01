/**
 * SocialX - Protected Route Component
 * Redirects unauthenticated users to login
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../config/constants';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'background.default',
        }}
      >
        <CircularProgress
          size={48}
          sx={{
            color: 'primary.main',
            filter: 'drop-shadow(0 0 12px rgba(232, 67, 147, 0.5))',
          }}
        />
      </Box>
    );
  }

  // React-Router state delay race condition fix:
  // Since Context state takes a microtask to update across the tree, we synchronously check localStorage so the
  // router doesn't instantly kick them out before the login() state finishes propagating.
  const hasToken = !!localStorage.getItem('socialx_access_token');

  if (!isAuthenticated && !hasToken) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
