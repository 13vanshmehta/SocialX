/**
 * SocialX - Animated Page Wrapper
 * Wraps pages with enter/exit animations
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ANIMATION } from '../../config/constants';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION.PAGE_TRANSITION,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: ANIMATION.FAST,
      ease: 'easeIn',
    },
  },
};

const AnimatedPage = ({ children, style = {} }) => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ width: '100%', ...style }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedPage;
