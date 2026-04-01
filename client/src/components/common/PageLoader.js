/**
 * SocialX - Page Loading Component
 * Removed aggressive loading screen per user request
 */

import React from 'react';
import { Box } from '@mui/material';

const PageLoader = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: '#FFFFFF',
      }}
    />
  );
};

export default PageLoader;
