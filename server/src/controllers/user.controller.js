const User = require('../models/User');

exports.updateProfile = async (req, res) => {
  try {
    const { fullName, bio } = req.body;
    let avatarUrl = req.body.avatar;

    if (req.file) {
      avatarUrl = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        ...(fullName && { fullName }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl && { avatar: avatarUrl }),
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    // Optionally delete user's posts and comments here
    res.status(200).json({ success: true, message: 'Account deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete account.' });
  }
};

exports.toggleNotifications = async (req, res) => {
  try {
    const targetUserId = req.params.targetUserId;
    if (targetUserId === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot subscribe to yourself.' });
    }

    const currentUser = await User.findById(req.user.id);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found.' });

    const isSubscribed = currentUser.subscribedTo.includes(targetUserId);

    if (isSubscribed) {
      currentUser.subscribedTo.pull(targetUserId);
      targetUser.subscribers.pull(req.user.id);
    } else {
      currentUser.subscribedTo.push(targetUserId);
      targetUser.subscribers.push(req.user.id);
    }

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({ 
      success: true, 
      message: isSubscribed ? 'Notifications disabled' : 'Notifications enabled',
      subscribedTo: currentUser.subscribedTo 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error toggling notifications.' });
  }
};
