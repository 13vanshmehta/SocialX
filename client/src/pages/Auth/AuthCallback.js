/**
 * SocialX - Google OAuth Callback Handler
 * Processes the redirect from Google OAuth and stores tokens
 */

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useSnackbar } from '../../context/SnackbarContext';
import { ROUTES } from '../../config/constants';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showSuccess, showError } = useSnackbar();
  const [error, setError] = useState(null);
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    
    const processAuth = () => {
      hasProcessed.current = true;
      try {
        // Check for error in URL params
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('error')) {
          setError('Authentication failed. Please try again.');
          showError('Google authentication failed.');
          setTimeout(() => navigate(ROUTES.LOGIN, { replace: true }), 2000);
          return;
        }

        // Get tokens from URL query parameters (sent securely over HTTPS)
        const params = new URLSearchParams(window.location.search);

        const accessToken = params.get('accessToken');
        const refreshToken = params.get('refreshToken');
        const userStr = params.get('user');

        if (accessToken && refreshToken && userStr) {
          const user = JSON.parse(decodeURIComponent(userStr));
          login(user, accessToken, refreshToken);
          showSuccess('Welcome to SocialX! 🎉');
          navigate(ROUTES.FEED, { replace: true });
        } else {
          setError('Authentication data missing.');
          showError('Authentication failed. Please try again.');
          setTimeout(() => navigate(ROUTES.LOGIN, { replace: true }), 2000);
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('Authentication processing failed.');
        showError('Something went wrong. Please try again.');
        setTimeout(() => navigate(ROUTES.LOGIN, { replace: true }), 2000);
      }
    };

    processAuth();
  }, [login, navigate, showSuccess, showError]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        gap: 2,
      }}
    >
      {error ? (
        <Typography color="error" variant="body1">
          {error}
        </Typography>
      ) : (
        <>
          <CircularProgress
            size={40}
            sx={{
              color: 'primary.main',
              filter: 'drop-shadow(0 0 10px rgba(232, 67, 147, 0.4))',
            }}
          />
          <Typography variant="body2" color="text.secondary">
            Completing sign in...
          </Typography>
        </>
      )}
    </Box>
  );
};

export default AuthCallback;
