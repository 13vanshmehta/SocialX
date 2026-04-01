/**
 * SocialX - Auth Layout
 * Light-themed wrapper for authentication pages (login, register, verify, forgot/reset password)
 * Mobile-first design matching reference (clean white UI)
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

const AuthLayout = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
        px: 2,
        pt: { xs: 4, sm: 6 },
        pb: 4,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '420px',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AuthLayout;
