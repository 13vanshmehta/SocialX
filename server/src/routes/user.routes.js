const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authenticate = require('../middleware/authenticate');
const upload = require('../middleware/upload');

router.use(authenticate);

// Update user profile
router.put('/profile', upload.single('avatar'), userController.updateProfile);

// Delete account
router.delete('/account', userController.deleteAccount);

// Toggle notifications
router.put('/:targetUserId/notifications', userController.toggleNotifications);

module.exports = router;
