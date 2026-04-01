/**
 * SocialX - Snackbar / Toast Context
 * Global notification system
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert, Slide } from '@mui/material';

const SnackbarContext = createContext(null);

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};

const SlideTransition = (props) => <Slide {...props} direction="up" />;

export const SnackbarProvider = ({ children }) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info', // 'success' | 'error' | 'warning' | 'info'
    duration: 4000,
  });

  const showSnackbar = useCallback((message, severity = 'info', duration = 4000) => {
    setSnackbar({ open: true, message, severity, duration });
  }, []);

  const showSuccess = useCallback(
    (message) => showSnackbar(message, 'success'),
    [showSnackbar]
  );

  const showError = useCallback(
    (message) => showSnackbar(message, 'error', 5000),
    [showSnackbar]
  );

  const showWarning = useCallback(
    (message) => showSnackbar(message, 'warning'),
    [showSnackbar]
  );

  const showInfo = useCallback(
    (message) => showSnackbar(message, 'info'),
    [showSnackbar]
  );

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const value = { showSnackbar, showSuccess, showError, showWarning, showInfo };

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.duration}
        onClose={handleClose}
        TransitionComponent={SlideTransition}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: '100%',
            borderRadius: '12px',
            fontWeight: 500,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export default SnackbarContext;
