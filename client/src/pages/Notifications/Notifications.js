import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, Typography, Avatar, List, ListItem, ListItemAvatar, 
  ListItemText, CircularProgress, IconButton, Container
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import notificationService from '../../services/notificationService';
import { useNavigate } from 'react-router-dom';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

const getFriendlyTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMin = Math.floor((now - date) / 60000);
    
    if (diffInMin < 1) return 'Just now';
    if (diffInMin < 60) return `${diffInMin} minutes ago`;
    
    const diffInHours = Math.floor(diffInMin / 60);
    if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
};

const getNotificationText = (notification) => {
  switch (notification.type) {
    case 'like': return 'liked your post';
    case 'comment': return 'commented on your post';
    case 'new_post': return 'has posted a new post.';
    default: return 'interacted with your account';
  }
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications();
      setNotifications(res.notifications || []);
      await notificationService.markAsRead();
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupedNotifications = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups = { Today: [], '1 Day ago': [], Earlier: [] };

    notifications.forEach(notif => {
      const date = new Date(notif.createdAt);
      date.setHours(0, 0, 0, 0);
      if (date.getTime() === today.getTime()) {
        groups.Today.push(notif);
      } else if (date.getTime() === yesterday.getTime()) {
        groups['1 Day ago'].push(notif);
      } else {
        groups.Earlier.push(notif);
      }
    });

    return Object.entries(groups).filter(([_, list]) => list.length > 0);
  }, [notifications]);

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#FFFFFF', pb: 12 }}>
      {/* Clean Header matching mockup */}
      <Box sx={{ 
        p: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, bgcolor: '#FFFFFF', zIndex: 10
      }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.4rem', color: '#000', letterSpacing: '-0.5px' }}>
          Notifications
        </Typography>
        <IconButton sx={{ color: '#000' }}>
          <SearchRoundedIcon sx={{ fontSize: 28 }} />
        </IconButton>
      </Box>

      <Container maxWidth="md" sx={{ px: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress size={30} sx={{ color: '#FA587D' }} />
          </Box>
        ) : notifications.length > 0 ? (
          <Box>
            {groupedNotifications.map(([title, list]) => (
              <Box key={title} sx={{ mb: 4 }}>
                <Typography sx={{ 
                  fontWeight: 800, fontSize: '1.2rem', color: '#000', 
                  mb: 2, ml: 0.5
                }}>
                  {title}
                </Typography>
                
                <List sx={{ p: 0 }}>
                  <AnimatePresence>
                    {list.map((notif, index) => (
                      <motion.div
                        key={notif._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <ListItem 
                          disableGutters
                          onClick={() => { if (notif.post) navigate(`/feed`); }}
                          sx={{
                            py: 1.8, 
                            cursor: 'pointer',
                            '&:active': { opacity: 0.7 }
                          }}
                        >
                          <ListItemAvatar sx={{ minWidth: 60 }}>
                            <Avatar 
                              src={notif.sender?.avatar} 
                              sx={{ width: 44, height: 44 }} 
                            />
                          </ListItemAvatar>
                          
                          <ListItemText
                            primary={
                                <Typography sx={{ fontSize: '1rem', color: '#000', lineHeight: 1.3 }}>
                                  <strong style={{ fontWeight: 800 }}>{notif.sender?.fullName}</strong> 
                                  {' '}{getNotificationText(notif)}
                                </Typography>
                            }
                            secondary={
                                <Typography sx={{ fontSize: '0.85rem', color: '#A0A0A0', mt: 0.5 }}>
                                  {getFriendlyTime(notif.createdAt)}
                                </Typography>
                            }
                          />

                          {notif.post?.images && notif.post.images.length > 0 && (
                            <Box 
                              component="img" 
                              src={notif.post.images[0].url} 
                              onError={(e) => { e.target.style.display = 'none'; }}
                              sx={{ 
                                width: 50, height: 50, borderRadius: '12px', 
                                objectFit: 'cover', ml: 2, flexShrink: 0
                              }} 
                            />
                          )}
                        </ListItem>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </List>
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ py: 10, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#A0A0A0' }}>No notifications yet.</Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Notifications;
