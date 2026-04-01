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

function App() {
  // Always show splash on page load / browser reload
  const [isBooting, setIsBooting] = React.useState(true);

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
