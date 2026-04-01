/**
 * SocialX - Login Page
 * Clean, minimal light-themed login matching reference design
 * Email/Password + Google OAuth — all auth handled by backend
 */

import React, { useState } from 'react';
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
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  MailOutline,
  LockOutlined,
} from '@mui/icons-material';
import { motion } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext';
import { useSnackbar } from '../../context/SnackbarContext';
import authService from '../../services/authService';
import { ROUTES } from '../../config/constants';
import { API_BASE_URL } from '../../config/api';
import { isValidEmail } from '../../utils/helpers';

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

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showSuccess, showError } = useSnackbar();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const from = location.state?.from?.pathname || ROUTES.FEED;

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await authService.login(formData.email, formData.password);
      login(response.user, response.accessToken, response.refreshToken);
      showSuccess('Welcome back! 🎉');
      navigate(from, { replace: true });
    } catch (error) {
      const data = error.response?.data;
      if (data?.code === 'EMAIL_NOT_VERIFIED') {
        showError('Email not verified. Please check your inbox for the OTP.');
        navigate(ROUTES.VERIFY_EMAIL, { state: { email: data.email } });
        return;
      }
      const message = data?.message || 'Login failed. Please check your credentials.';
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const googleAuthUrl = `${API_BASE_URL}/auth/google`;
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
        <title>Log In — SocialX</title>
        <meta name="description" content="Log in to your SocialX account" />
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
            mb: 4,
            fontSize: { xs: '1.75rem', sm: '2rem' },
          }}
        >
          Log In
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
          <input type="email" name="fake_email" style={{ display: 'none' }} aria-hidden="true" />
          <input type="password" name="fake_password" style={{ display: 'none' }} aria-hidden="true" />

          {/* Email */}
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ color: '#999', fontSize: '0.75rem', mb: 0.5, ml: 0.5 }}>Email</Typography>
            <TextField
              id="login-email"
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
          <Box sx={{ mb: 1.5 }}>
            <Typography sx={{ color: '#999', fontSize: '0.75rem', mb: 0.5, ml: 0.5 }}>Password</Typography>
            <TextField
              id="login-password"
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
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      sx={{ color: '#BBB' }}
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />
          </Box>

          {/* Remember Me + Forgot Password */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  size="small"
                  sx={{
                    color: '#DDD',
                    '&.Mui-checked': { color: '#E84393' },
                  }}
                />
              }
              label={
                <Typography sx={{ fontSize: '0.8rem', color: '#888' }}>
                  Remember Me
                </Typography>
              }
            />
            <Link
              component={RouterLink}
              to={ROUTES.FORGOT_PASSWORD}
              sx={{
                fontSize: '0.8rem',
                color: '#E84393',
                fontWeight: 500,
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Forgotten Password?
            </Link>
          </Box>

          {/* Log In Button */}
          <Button
            id="login-submit-btn"
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
              '&:disabled': {
                background: '#F0F0F0',
                color: '#AAA',
              },
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: '#FFF' }} /> : 'Log In'}
          </Button>

          {/* Or Log In with */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 3 }}>
            <Box sx={{ flex: 1, height: '1px', backgroundColor: '#EAEAEA' }} />
            <Typography sx={{ color: '#CCC', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
              Or Log in with
            </Typography>
            <Box sx={{ flex: 1, height: '1px', backgroundColor: '#EAEAEA' }} />
          </Box>

          {/* Google Button */}
          <Button
            id="google-login-btn"
            fullWidth
            onClick={handleGoogleLogin}
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
              '&:hover': {
                backgroundColor: '#F8F8F8',
                borderColor: '#DDD',
              },
            }}
          >
            Google
          </Button>
        </Box>
      </motion.div>

      {/* Sign Up Link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <Typography
          sx={{
            textAlign: 'center',
            mt: 4,
            color: '#999',
            fontSize: '0.85rem',
          }}
        >
          Don't have an account?{' '}
          <Link
            component={RouterLink}
            to={ROUTES.REGISTER}
            sx={{
              color: '#E84393',
              fontWeight: 600,
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Create Account
          </Link>
        </Typography>
      </motion.div>
    </>
  );
};

export default Login;
