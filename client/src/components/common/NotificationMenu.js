import React, { useState, useEffect } from 'react';
import { Menu, MenuItem, Box, Typography, Avatar, Divider, CircularProgress, Button } from '@mui/material';
import notificationService from '../../services/notificationService';
import { useNavigate } from 'react-router-dom';

const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

const getNotificationText = (notification) => {
  switch (notification.type) {
    case 'like':
      return 'liked your post';
    case 'comment':
      return 'commented on your post';
    case 'new_post':
      return 'has posted a post.';
    default:
      return 'interacted with your account';
  }
};

const NotificationMenu = ({ anchorEl, open, onClose, onMarkRead }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications();
      setNotifications(res.notifications);
      if (onMarkRead) onMarkRead();
      // Silently mark as read on backend
      await notificationService.markAsRead();
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: 350,
            maxHeight: 450,
            overflowY: 'auto',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            bgcolor: '#FFFFFF', // Clear white background
            color: '#1A1A1A', // Dark text color
            '&::-webkit-scrollbar': { width: '4px' },
            '&::-webkit-scrollbar-thumb': { backgroundColor: '#E0E0E0', borderRadius: '4px' }
          }
        }
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#1A1A1A' }}>Notifications</Typography>
        <Typography 
          onClick={() => { navigate('/notifications'); onClose(); }}
          sx={{ fontSize: '0.85rem', color: '#FA587D', cursor: 'pointer', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
        >
          See All
        </Typography>
      </Box>
      <Divider />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={24} sx={{ color: '#FA587D' }} />
        </Box>
      ) : notifications.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography sx={{ color: '#A0A0A0' }}>No notifications yet.</Typography>
        </Box>
      ) : (
        notifications.map((notif) => (
          <MenuItem 
            key={notif._id} 
            sx={{ 
              py: 1.5, px: 2, 
              display: 'flex', 
              gap: 1.5, 
              alignItems: 'center',
              backgroundColor: notif.read ? 'transparent' : 'rgba(250, 88, 125, 0.05)',
              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
            }}
            onClick={() => {
              if (notif.post) navigate(`/feed`);
              onClose();
            }}
          >
            <Avatar src={notif.sender?.avatar} sx={{ width: 44, height: 44 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography sx={{ fontSize: '0.9rem', lineHeight: 1.4, color: '#1A1A1A' }}>
                <strong style={{ color: '#000' }}>{notif.sender?.fullName}</strong> {getNotificationText(notif)}
              </Typography>
              <Typography variant="caption" sx={{ color: '#707070', mt: 0.5, display: 'block' }}>
                {formatTime(notif.createdAt)}
              </Typography>
            </Box>
          </MenuItem>
        ))
      )}
      <Divider />
      <Box sx={{ p: 1, textAlign: 'center' }}>
        <Button 
          fullWidth 
          onClick={() => { navigate('/notifications'); onClose(); }}
          sx={{ color: '#1A1A1A', textTransform: 'none', fontWeight: 600, fontSize: '0.9rem' }}
        >
          View 30-day history
        </Button>
      </Box>
    </Menu>
  );
};

export default NotificationMenu;
