/**
 * SocialX - Root Application Component
 * Sets up theme, providers, and routing
 */

import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { HelmetProvider } from 'react-helmet-async';

// Config
import theme from './config/theme';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { SnackbarProvider } from './context/SnackbarContext';

// Router
import router from './router/AppRouter';

// Common Components
import { PageLoader, GlobalSplash } from './components/common';
import { API_BASE_URL } from './config/api';

function App() {
  // Always show splash on page load / browser reload
  const [isBooting, setIsBooting] = React.useState(true);

  // Periodically verify backend availability for active/inactive status checks
  React.useEffect(() => {
    const healthCheck = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/health-check`);
        if (!response.ok) {
          console.warn('Backend health check failed:', response.status);
        }
      } catch (error) {
        console.warn('Backend appears inactive/unreachable:', error);
      }
    };

    // Check once on app load, then every 2 minutes
    healthCheck();
    const interval = setInterval(healthCheck, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <HelmetProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <SnackbarProvider>
            {isBooting ? (
              <GlobalSplash onComplete={() => setIsBooting(false)} />
            ) : (
              <RouterProvider router={router} fallbackElement={<PageLoader />} />
            )}
          </SnackbarProvider>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
