/**
 * SocialX - Forgot Password Page (Light theme)
 * Sends OTP to registered email for password reset
 */

import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  CircularProgress,
  Link,
} from '@mui/material';
import { MailOutline } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useSnackbar } from '../../context/SnackbarContext';
import authService from '../../services/authService';
import { ROUTES } from '../../config/constants';
import { isValidEmail } from '../../utils/helpers';

const fieldSx = {
  mb: 0,
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#FAFAFA',
    '& fieldset': { borderColor: '#E8E8E8' },
    '&:hover fieldset': { borderColor: '#CCC' },
    '&.Mui-focused fieldset': { borderColor: '#E84393', borderWidth: 1.5 },
  },
  '& .MuiInputLabel-root': { color: '#999' },
  '& .MuiOutlinedInput-input': { color: '#333' },
};

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useSnackbar();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setEmailError('Email is required'); return; }
    if (!isValidEmail(email)) { setEmailError('Please enter a valid email'); return; }

    setLoading(true);
    try {
      await authService.forgotPassword(email.trim().toLowerCase());
      setSent(true);
      showSuccess('OTP sent to your email!');
      setTimeout(() => {
        navigate(ROUTES.RESET_PASSWORD, { state: { email: email.trim().toLowerCase() } });
      }, 1500);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Forgot Password — SocialX</title>
      </Helmet>

      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
        <IconButton onClick={() => navigate(ROUTES.LOGIN)} sx={{ mb: 1, color: '#333', ml: -1 }}>
          <Box component="span" sx={{ fontSize: '1.2rem' }}>←</Box>
        </IconButton>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1A1A1A', mb: 1.5, fontSize: { xs: '1.75rem', sm: '2rem' } }}>
          Forgot Password?
        </Typography>
        <Typography sx={{ color: '#888', fontSize: '0.85rem', mb: 4, lineHeight: 1.6 }}>
          Enter your registered email and we'll send you an OTP to reset your password.
        </Typography>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ color: '#999', fontSize: '0.75rem', mb: 0.5, ml: 0.5 }}>Email</Typography>
            <TextField
              id="forgot-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              fullWidth
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
              error={!!emailError}
              helperText={emailError}
              disabled={loading || sent}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MailOutline sx={{ color: '#BBB', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />
          </Box>

          <Button
            id="forgot-submit-btn"
            type="submit"
            fullWidth
            disabled={loading || sent}
            sx={{
              py: 1.5,
              fontSize: '0.95rem',
              fontWeight: 600,
              color: '#FFF',
              background: sent ? 'linear-gradient(135deg, #55EFC4, #00CEC9)' : 'linear-gradient(135deg, #E84393 0%, #6C5CE7 50%, #0984E3 100%)',
              borderRadius: '14px',
              textTransform: 'none',
              '&:disabled': {
                background: sent ? 'linear-gradient(135deg, #55EFC4, #00CEC9)' : '#F0F0F0',
                color: sent ? '#FFF' : '#AAA',
              },
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: '#FFF' }} /> : sent ? '✓ OTP Sent!' : 'Send OTP'}
          </Button>
        </Box>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Link
            component={RouterLink}
            to={ROUTES.LOGIN}
            sx={{ color: '#999', fontSize: '0.85rem', fontWeight: 500, '&:hover': { color: '#E84393' } }}
          >
            ← Back to Log In
          </Link>
        </Box>
      </motion.div>
    </>
  );
};

export default ForgotPassword;
