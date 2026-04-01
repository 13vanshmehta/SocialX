/**
 * SocialX - Splash Screen / Landing Page
 * Clean white design with centered brand logo,
 * Log In / Create Account buttons, and background health-check
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../config/constants';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  // If already authenticated, go to feed
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(ROUTES.FEED, { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  const fullText = "Share Life Your Way";
  const [typedText, setTypedText] = useState('');

  // Typing effect
  useEffect(() => {
    let currentText = '';
    let currIndex = 0;
    
    // start slightly faster for the unauth landing
    const startDelay = setTimeout(() => {
      const interval = setInterval(() => {
        if (currIndex < fullText.length) {
          currentText += fullText[currIndex];
          setTypedText(currentText);
          currIndex++;
        } else {
          clearInterval(interval);
        }
      }, 50);
      return () => clearInterval(interval);
    }, 400);
    
    return () => clearTimeout(startDelay);
  }, []);

  const handleLogin = () => navigate(ROUTES.LOGIN);
  const handleCreateAccount = () => navigate(ROUTES.REGISTER);

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
        px: 2,
      }}
    >
      {/* Brand Logo */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Box
          component="img"
          src="/app-logo/Brand Logo -  With Tagline.png"
          alt="SocialX - A Social Media App"
          sx={{
            width: { xs: 220, sm: 280, md: 320 },
            height: 'auto',
            objectFit: 'contain',
          }}
        />
      </motion.div>

      {/* Subtitle with typing effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.2 }}
      >
        <Typography
          sx={{
            mt: 2,
            color: '#999',
            fontSize: { xs: '0.85rem', sm: '0.95rem' },
            fontWeight: 400,
            letterSpacing: '0.06em',
            fontFamily: '"Inter", sans-serif',
            minHeight: '24px',
          }}
        >
          {typedText}
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.7 }}
            style={{ marginLeft: 2 }}
          >
            |
          </motion.span>
        </Typography>
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5, ease: 'easeOut' }}
        style={{
          width: '100%',
          maxWidth: 320,
          marginTop: 48,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <Button
          id="splash-login-btn"
          fullWidth
          onClick={handleLogin}
          sx={{
            py: 1.5,
            fontSize: '0.95rem',
            fontWeight: 600,
            color: '#333',
            backgroundColor: '#F5F5F5',
            borderRadius: '14px',
            border: '1px solid #E0E0E0',
            textTransform: 'none',
            '&:hover': { backgroundColor: '#EBEBEB' },
          }}
        >
          Log In
        </Button>

        <Button
          id="splash-register-btn"
          fullWidth
          onClick={handleCreateAccount}
          sx={{
            py: 1.5,
            fontSize: '0.95rem',
            fontWeight: 600,
            color: '#FFFFFF',
            background: 'linear-gradient(135deg, #E84393 0%, #6C5CE7 50%, #0984E3 100%)',
            borderRadius: '14px',
            textTransform: 'none',
            boxShadow: '0 4px 16px rgba(232, 67, 147, 0.25)',
            '&:hover': {
              background: 'linear-gradient(135deg, #E84393 0%, #6C5CE7 50%, #0984E3 100%)',
              boxShadow: '0 6px 24px rgba(232, 67, 147, 0.35)',
              transform: 'translateY(-1px)',
            },
          }}
        >
          Create Account
        </Button>
      </motion.div>

      {/* Bottom text */}
      <Box sx={{ position: 'absolute', bottom: 24 }}>
        <Typography sx={{ color: '#CCC', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
          Stay in the Loop
        </Typography>
      </Box>
    </Box>
  );
};

export default Home;
