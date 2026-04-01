/**
 * SocialX - Main Layout
 * Wraps authenticated pages with navbar and consistent layout
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import BottomNav from './components/BottomNav';
import WebSidebar from './components/WebSidebar';

const MainLayout = () => {
  const theme = useTheme();
  // We use md (900px) as the breakpoint to switch from Mobile to Web Layout
  const isWeb = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: '#FFFFFF', // Clean White theme background
      }}
    >
      {/* Left Sidebar for Web */}
      {isWeb && <WebSidebar />}

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          // Space out the left side for the sidebar when in web mode
          marginLeft: isWeb ? '250px' : 0,
          // Padding bottom only for mobile so content doesn't get hidden behind BottomNav
          paddingBottom: isWeb ? 0 : '80px',
          paddingTop: isWeb ? 4 : 0, // Add top padding for web
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: isWeb ? '630px' : '100vw', // 630px roughly matches IG feed width
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Outlet />
        </Box>
      </Box>


      {/* Bottom Nav for Mobile */}
      {!isWeb && <BottomNav />}
    </Box>
  );
};

export default MainLayout;
