/**
 * SocialX - Verify Email (OTP) Page
 * After registration, user enters the OTP sent to their email
 * On success → account is verified → navigate to login
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { motion } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext';
import { useSnackbar } from '../../context/SnackbarContext';
import authService from '../../services/authService';
import { ROUTES } from '../../config/constants';

const OTP_LENGTH = 4;

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showSuccess, showError } = useSnackbar();

  const email = location.state?.email || '';

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const otpRefs = useRef([]);

  // Redirect if no email in state
  useEffect(() => {
    if (!email) {
      navigate(ROUTES.REGISTER, { replace: true });
    }
  }, [email, navigate]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  // -----------------------------------
  // OTP Input Handlers
  // -----------------------------------
  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, OTP_LENGTH);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    const focusIndex = Math.min(pastedData.length, OTP_LENGTH - 1);
    otpRefs.current[focusIndex]?.focus();
  };

  // -----------------------------------
  // Verify OTP
  // -----------------------------------
  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length < OTP_LENGTH) {
      showError('Please enter the complete OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.verifyEmail(email, otpString);
      // After verification, log the user in if tokens are returned
      if (response.accessToken) {
        login(response.user, response.accessToken, response.refreshToken);
        showSuccess('Account created successfully! 🎉');
        navigate(ROUTES.FEED, { replace: true });
      } else {
        showSuccess('Email verified! Please log in.');
        navigate(ROUTES.LOGIN, { replace: true });
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid OTP. Please try again.';
      showError(message);
      setOtp(Array(OTP_LENGTH).fill(''));
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------
  // Resend OTP
  // -----------------------------------
  const handleResend = useCallback(async () => {
    if (!canResend) return;
    try {
      await authService.resendVerifyOtp(email);
      showSuccess('New OTP sent!');
      setResendTimer(60);
      setCanResend(false);
      setOtp(Array(OTP_LENGTH).fill(''));
      otpRefs.current[0]?.focus();
    } catch (error) {
      showError('Failed to resend OTP. Please try again.');
    }
  }, [canResend, email, showSuccess, showError]);

  // Format timer
  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!email) return null;

  return (
    <>
      <Helmet>
        <title>Enter OTP — SocialX</title>
        <meta name="description" content="Verify your email with OTP" />
      </Helmet>

      {/* Back arrow */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <IconButton
          onClick={() => navigate(ROUTES.REGISTER)}
          sx={{ mb: 1, color: '#333', ml: -1 }}
        >
          <Box component="span" sx={{ fontSize: '1.2rem' }}>←</Box>
        </IconButton>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#1A1A1A',
            mb: 1.5,
            fontSize: { xs: '1.75rem', sm: '2rem' },
          }}
        >
          Enter OTP
        </Typography>
        <Typography sx={{ color: '#888', fontSize: '0.85rem', mb: 4, lineHeight: 1.6 }}>
          OTP sent to your email address{' '}
          <Box component="span" sx={{ color: '#E84393', fontWeight: 600 }}>
            {email}
          </Box>
          . Enter the code to proceed.
        </Typography>
      </motion.div>

      {/* OTP Inputs */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: { xs: 1.5, sm: 2 },
            justifyContent: 'center',
            mb: 3,
          }}
        >
          {otp.map((digit, index) => (
            <TextField
              key={index}
              inputRef={(el) => (otpRefs.current[index] = el)}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              onPaste={index === 0 ? handleOtpPaste : undefined}
              inputProps={{
                maxLength: 1,
                style: {
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  padding: '16px 0',
                  color: '#1A1A1A',
                },
              }}
              disabled={loading}
              sx={{
                width: { xs: 56, sm: 64 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '16px',
                  backgroundColor: digit ? 'rgba(232, 67, 147, 0.04)' : '#FAFAFA',
                  '& fieldset': {
                    borderColor: digit ? 'rgba(232, 67, 147, 0.4)' : '#E8E8E8',
                    borderWidth: digit ? 2 : 1,
                  },
                  '&:hover fieldset': { borderColor: '#E84393' },
                  '&.Mui-focused fieldset': { borderColor: '#E84393', borderWidth: 2 },
                },
              }}
            />
          ))}
        </Box>

        {/* Resend Code */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography sx={{ fontSize: '0.8rem', color: '#999' }}>
            Resend Code{' '}
            {canResend ? (
              <Box
                component="span"
                onClick={handleResend}
                sx={{
                  color: '#E84393',
                  fontWeight: 600,
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Send Again
              </Box>
            ) : (
              <Box component="span" sx={{ color: '#E84393', fontWeight: 600 }}>
                {formatTimer(resendTimer)}
              </Box>
            )}
          </Typography>
        </Box>

        {/* Create Account Button */}
        <Button
          id="verify-email-btn"
          fullWidth
          onClick={handleVerify}
          disabled={loading || otp.join('').length < OTP_LENGTH}
          sx={{
            py: 1.5,
            fontSize: '0.95rem',
            fontWeight: 600,
            color: '#FFF',
            background: 'linear-gradient(135deg, #E84393 0%, #6C5CE7 50%, #0984E3 100%)',
            borderRadius: '14px',
            textTransform: 'none',
            boxShadow: '0 4px 16px rgba(232, 67, 147, 0.2)',
            '&:hover': {
              background: 'linear-gradient(135deg, #E84393 0%, #6C5CE7 50%, #0984E3 100%)',
              boxShadow: '0 6px 24px rgba(232, 67, 147, 0.3)',
            },
            '&:disabled': { background: '#F0F0F0', color: '#AAA' },
          }}
        >
          {loading ? <CircularProgress size={24} sx={{ color: '#FFF' }} /> : 'Create Account'}
        </Button>
      </motion.div>
    </>
  );
};

export default VerifyEmail;
