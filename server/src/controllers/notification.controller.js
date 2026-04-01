const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const notifications = await Notification.find({ 
      recipient: req.user.id,
      createdAt: { $gte: thirtyDaysAgo }
    })
      .populate('sender', 'fullName username avatar')
      .populate('post', 'content images')
      .sort({ createdAt: -1 });

    const unreadCount = await Notification.countDocuments({ 
      recipient: req.user.id, 
      read: false 
    });

    res.status(200).json({ 
      success: true, 
      count: notifications.length, 
      unreadCount,
      notifications 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true }
    );
    res.status(200).json({ success: true, message: 'Notifications marked as read.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark as read.' });
  }
};
