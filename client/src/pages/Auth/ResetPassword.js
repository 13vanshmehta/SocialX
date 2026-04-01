/**
 * SocialX - Reset Password Page (Light theme)
 * Enter OTP + New password to reset
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
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
import { Visibility, VisibilityOff, LockOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useSnackbar } from '../../context/SnackbarContext';
import authService from '../../services/authService';
import { ROUTES } from '../../config/constants';
import { validatePassword } from '../../utils/helpers';

const OTP_LENGTH = 6;

const fieldSx = {
  mb: 0,
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#FAFAFA',
    '& fieldset': { borderColor: '#E8E8E8' },
    '&:hover fieldset': { borderColor: '#CCC' },
    '&.Mui-focused fieldset': { borderColor: '#E84393', borderWidth: 1.5 },
  },
  '& .MuiOutlinedInput-input': { color: '#333' },
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useSnackbar();

  const email = location.state?.email || '';

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const otpRefs = useRef([]);

  useEffect(() => {
    if (!email) navigate(ROUTES.FORGOT_PASSWORD, { replace: true });
  }, [email, navigate]);

  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < OTP_LENGTH - 1) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, OTP_LENGTH);
    if (!/^\d+$/.test(pastedData)) return;
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) newOtp[i] = pastedData[i];
    setOtp(newOtp);
    otpRefs.current[Math.min(pastedData.length, OTP_LENGTH - 1)]?.focus();
  };

  const validate = () => {
    const newErrors = {};
    if (otp.join('').length < OTP_LENGTH) newErrors.otp = 'Enter the complete OTP';
    if (!newPassword) {
      newErrors.password = 'New password is required';
    } else if (!validatePassword(newPassword).isValid) {
      newErrors.password = 'Min 8 chars with uppercase, lowercase, number & special char';
    }
    if (newPassword !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await authService.resetPassword(email, otp.join(''), newPassword);
      showSuccess('Password reset successfully!');
      navigate(ROUTES.LOGIN, { replace: true });
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null;

  return (
    <>
      <Helmet><title>Reset Password — SocialX</title></Helmet>

      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
        <IconButton onClick={() => navigate(ROUTES.FORGOT_PASSWORD)} sx={{ mb: 1, color: '#333', ml: -1 }}>
          <Box component="span" sx={{ fontSize: '1.2rem' }}>←</Box>
        </IconButton>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1A1A1A', mb: 1.5, fontSize: { xs: '1.75rem', sm: '2rem' } }}>
          Reset Password
        </Typography>
        <Typography sx={{ color: '#888', fontSize: '0.85rem', mb: 3, lineHeight: 1.6 }}>
          Enter the OTP sent to <Box component="span" sx={{ color: '#E84393', fontWeight: 600 }}>{email}</Box>
        </Typography>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          {/* OTP */}
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 1 }}>
            {otp.map((digit, index) => (
              <TextField
                key={index}
                inputRef={(el) => (otpRefs.current[index] = el)}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                onPaste={index === 0 ? handleOtpPaste : undefined}
                inputProps={{ maxLength: 1, style: { textAlign: 'center', fontSize: '1.3rem', fontWeight: 700, padding: '12px 0', color: '#1A1A1A' } }}
                disabled={loading}
                sx={{
                  width: 48,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: digit ? 'rgba(232, 67, 147, 0.04)' : '#FAFAFA',
                    '& fieldset': { borderColor: digit ? 'rgba(232, 67, 147, 0.4)' : '#E8E8E8' },
                    '&.Mui-focused fieldset': { borderColor: '#E84393', borderWidth: 2 },
                  },
                }}
              />
            ))}
          </Box>
          {errors.otp && <Typography sx={{ color: '#FF5252', fontSize: '0.7rem', textAlign: 'center', mb: 2 }}>{errors.otp}</Typography>}

          {/* New Password */}
          <Box sx={{ mb: 2, mt: 3 }}>
            <Typography sx={{ color: '#999', fontSize: '0.75rem', mb: 0.5, ml: 0.5 }}>New Password</Typography>
            <TextField
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              fullWidth
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); if (errors.password) setErrors((p) => ({ ...p, password: '' })); }}
              error={!!errors.password}
              helperText={errors.password}
              disabled={loading}
              InputProps={{
                startAdornment: <InputAdornment position="start"><LockOutlined sx={{ color: '#BBB', fontSize: 20 }} /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small" sx={{ color: '#BBB' }}>
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />
          </Box>

          {/* Confirm */}
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ color: '#999', fontSize: '0.75rem', mb: 0.5, ml: 0.5 }}>Confirm New Password</Typography>
            <TextField
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              fullWidth
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: '' })); }}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              disabled={loading}
              InputProps={{
                startAdornment: <InputAdornment position="start"><LockOutlined sx={{ color: '#BBB', fontSize: 20 }} /></InputAdornment>,
              }}
              sx={fieldSx}
            />
          </Box>

          <Button
            type="submit"
            fullWidth
            disabled={loading}
            sx={{
              py: 1.5,
              fontSize: '0.95rem',
              fontWeight: 600,
              color: '#FFF',
              background: 'linear-gradient(135deg, #E84393 0%, #6C5CE7 50%, #0984E3 100%)',
              borderRadius: '14px',
              textTransform: 'none',
              '&:disabled': { background: '#F0F0F0', color: '#AAA' },
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: '#FFF' }} /> : 'Reset Password'}
          </Button>
        </Box>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Link component={RouterLink} to={ROUTES.LOGIN} sx={{ color: '#999', fontSize: '0.85rem', '&:hover': { color: '#E84393' } }}>
            ← Back to Log In
          </Link>
        </Box>
      </motion.div>
    </>
  );
};

export default ResetPassword;
