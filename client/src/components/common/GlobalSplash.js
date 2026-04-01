import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

const HEALTH_CHECK_URL = `${API_BASE_URL.replace('/api', '')}/api/health-check`;

const GlobalSplash = ({ onComplete }) => {
  const [animationDone, setAnimationDone] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking');
  const [showError, setShowError] = useState(false);
  
  const logoRef = useRef(null);

  // Health Check
  const checkHealth = useCallback(async () => {
    try {
      setServerStatus('checking');
      setShowError(false);
      const response = await axios.get(HEALTH_CHECK_URL, { timeout: 8000 });
      if (response.status === 200) {
        setServerStatus('online');
      } else {
        setServerStatus('offline');
      }
    } catch (error) {
      console.error('Health check failed:', error.message);
      setServerStatus('offline');
    }
  }, []);

  useEffect(() => { checkHealth(); }, [checkHealth]);

  // Logo GSAP animation
  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        setTimeout(() => setAnimationDone(true), 600);
      },
    });

    if (logoRef.current) {
      tl.fromTo(
        logoRef.current,
        { scale: 0.5, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.2, ease: 'back.out(1.4)' },
        0.3
      );
    }

    return () => tl.kill();
  }, []);

  const fullText = "Share Life Your Way";
  const [typedText, setTypedText] = useState('');

  // Typing effect
  useEffect(() => {
    let currentText = '';
    let currIndex = 0;
    
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
    }, 1100);
    
    return () => clearTimeout(startDelay);
  }, []);

  // When both animation and server check are completely done successfully -> unmount Splash!
  useEffect(() => {
    if (animationDone && serverStatus === 'online') {
      // Add a tiny delay to ensure a smooth handoff
      setTimeout(onComplete, 300);
    } else if (animationDone && serverStatus === 'offline') {
      setShowError(true);
    }
  }, [animationDone, serverStatus, onComplete]);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw', height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        zIndex: 99999,
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      <motion.div ref={logoRef} style={{ opacity: 0 }}>
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

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.2 }}
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

      {/* Loading spinner */}
      <AnimatePresence>
        {animationDone && serverStatus === 'checking' && !showError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ marginTop: 40 }}
          >
            <CircularProgress size={28} sx={{ color: '#E84393' }} />
          </motion.div>
        )}
      </AnimatePresence>

      <Box sx={{ position: 'absolute', bottom: 24 }}>
        <Typography sx={{ color: '#CCC', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
          Initializing App...
        </Typography>
      </Box>
    </Box>
  );
};

export default GlobalSplash;
