/**
 * SocialX - Health Check Route
 * Used by the frontend splash screen to verify server connectivity
 */

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

router.get('/', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const isHealthy = dbState === 1;

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    message: isHealthy ? 'Server is running' : 'Server is degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus[dbState] || 'unknown',
    environment: process.env.NODE_ENV || 'development',
  });
});

module.exports = router;
