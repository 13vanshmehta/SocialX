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

  // Setup periodic health check to keep Render free-tier backend awake
  React.useEffect(() => {
    // Ping every 10 minutes (600000ms)
    // Render typically sleeps after 15 minutes of inactivity
    const interval = setInterval(() => {
      fetch(`${API_BASE_URL}/health-check`)
        .then(res => res.json())
        .catch(err => console.log('Keep-alive ping failed:', err));
    }, 10 * 60 * 1000);

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
