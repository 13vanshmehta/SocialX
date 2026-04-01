/**
 * SocialX - Create Account (Register) Page
 * Email, Password, Confirm Password, Terms of Service
 * After "Continue" → sends OTP to email → navigates to Verify Email page
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
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  MailOutline,
  LockOutlined,
  PersonOutline,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useSnackbar } from '../../context/SnackbarContext';
import authService from '../../services/authService';
import { ROUTES } from '../../config/constants';
import { isValidEmail, validatePassword } from '../../utils/helpers';

// Light-theme field styles
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
  '& .MuiInputLabel-root.Mui-focused': { color: '#E84393' },
  '& .MuiOutlinedInput-input': { color: '#333' },
  '& .MuiFormHelperText-root': { color: '#FF5252' },
};

const Register = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useSnackbar();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const { isValid } = validatePassword(formData.password);
      if (!isValid) {
        newErrors.password = 'Min 8 chars with uppercase, lowercase, number & special char';
      }
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!agreeTerms) {
      newErrors.terms = 'You must agree to the Terms of Service';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // Register user — backend sends verification OTP to email
      await authService.register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });
      showSuccess('Verification OTP sent to your email!');
      // Navigate to OTP verification page
      navigate(ROUTES.VERIFY_EMAIL, {
        state: {
          email: formData.email.trim().toLowerCase(),
          fullName: formData.fullName.trim(),
        },
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    const googleAuthUrl = `${process.env.REACT_APP_API_BASE_URL || ''}/auth/google`;
    window.location.href = googleAuthUrl;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  return (
    <>
      <Helmet>
        <title>Create Account — SocialX</title>
        <meta name="description" content="Create your SocialX account" />
      </Helmet>

      {/* Back arrow */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <IconButton
          onClick={() => navigate(ROUTES.HOME)}
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
            mb: 3,
            fontSize: { xs: '1.75rem', sm: '2rem' },
          }}
        >
          Create Account
        </Typography>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off">
          {/* Trick browser to not auto-fill on load */}
          <input type="text" name="fake_text" style={{ display: 'none' }} aria-hidden="true" />
          <input type="email" name="fake_email" style={{ display: 'none' }} aria-hidden="true" />
          <input type="password" name="fake_password" style={{ display: 'none' }} aria-hidden="true" />

          {/* Full Name */}
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ color: '#999', fontSize: '0.75rem', mb: 0.5, ml: 0.5 }}>Full Name</Typography>
            <TextField
              id="register-fullname"
              name="fullName"
              placeholder="John Doe"
              autoComplete="off"
              fullWidth
              value={formData.fullName}
              onChange={handleChange}
              error={!!errors.fullName}
              helperText={errors.fullName}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutline sx={{ color: '#BBB', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />
          </Box>

          {/* Email */}
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ color: '#999', fontSize: '0.75rem', mb: 0.5, ml: 0.5 }}>Email</Typography>
            <TextField
              id="register-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="off"
              fullWidth
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              disabled={loading}
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

          {/* Password */}
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ color: '#999', fontSize: '0.75rem', mb: 0.5, ml: 0.5 }}>Password</Typography>
            <TextField
              id="register-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              fullWidth
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ color: '#BBB', fontSize: 20 }} />
                  </InputAdornment>
                ),
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

          {/* Confirm Password */}
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ color: '#999', fontSize: '0.75rem', mb: 0.5, ml: 0.5 }}>Confirm Password</Typography>
            <TextField
              id="register-confirm-password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              fullWidth
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ color: '#BBB', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" size="small" sx={{ color: '#BBB' }}>
                      {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />
          </Box>

          {/* Terms of Service */}
          <FormControlLabel
            control={
              <Checkbox
                checked={agreeTerms}
                onChange={(e) => {
                  setAgreeTerms(e.target.checked);
                  if (errors.terms) setErrors((prev) => ({ ...prev, terms: '' }));
                }}
                size="small"
                sx={{
                  color: '#DDD',
                  '&.Mui-checked': { color: '#E84393' },
                }}
              />
            }
            label={
              <Typography sx={{ fontSize: '0.8rem', color: '#888' }}>
                I agree to the{' '}
                <Box component="span" sx={{ color: '#6C5CE7', fontWeight: 600, cursor: 'pointer' }}>
                  Terms of Service
                </Box>
              </Typography>
            }
            sx={{ mb: errors.terms ? 0 : 2.5 }}
          />
          {errors.terms && (
            <Typography sx={{ color: '#FF5252', fontSize: '0.7rem', ml: 4, mb: 2 }}>
              {errors.terms}
            </Typography>
          )}

          {/* Continue Button */}
          <Button
            id="register-submit-btn"
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
              boxShadow: '0 4px 16px rgba(232, 67, 147, 0.2)',
              '&:hover': {
                background: 'linear-gradient(135deg, #E84393 0%, #6C5CE7 50%, #0984E3 100%)',
                boxShadow: '0 6px 24px rgba(232, 67, 147, 0.3)',
              },
              '&:disabled': { background: '#F0F0F0', color: '#AAA' },
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: '#FFF' }} /> : 'Continue'}
          </Button>

          {/* Or Create with */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 3 }}>
            <Box sx={{ flex: 1, height: '1px', backgroundColor: '#EAEAEA' }} />
            <Typography sx={{ color: '#CCC', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
              Or Create with
            </Typography>
            <Box sx={{ flex: 1, height: '1px', backgroundColor: '#EAEAEA' }} />
          </Box>

          {/* Google Button */}
          <Button
            id="google-signup-btn"
            fullWidth
            onClick={handleGoogleSignup}
            disabled={loading}
            startIcon={
              <Box
                component="img"
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                sx={{ width: 20, height: 20 }}
              />
            }
            sx={{
              py: 1.3,
              borderRadius: '14px',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#333',
              backgroundColor: '#FFF',
              border: '1px solid #E8E8E8',
              textTransform: 'none',
              '&:hover': { backgroundColor: '#F8F8F8', borderColor: '#DDD' },
            }}
          >
            Google
          </Button>
        </Box>
      </motion.div>

      {/* Login Link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <Typography sx={{ textAlign: 'center', mt: 3, color: '#999', fontSize: '0.85rem' }}>
          Do you have an account?{' '}
          <Link
            component={RouterLink}
            to={ROUTES.LOGIN}
            sx={{ color: '#E84393', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
          >
            Log In
          </Link>
        </Typography>
      </motion.div>
    </>
  );
};

export default Register;
