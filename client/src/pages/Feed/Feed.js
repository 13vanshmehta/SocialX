import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Box, Typography, Avatar, IconButton, CircularProgress, LinearProgress } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import PostCard from '../../components/post/PostCard';
import postService from '../../services/postService';
import { useAuth } from '../../context/AuthContext';
import { useSnackbar } from '../../context/SnackbarContext';
import notificationService from '../../services/notificationService';
import NotificationMenu from '../../components/common/NotificationMenu';

const PULL_THRESHOLD = 80; // px to drag before triggering refresh

const Feed = () => {
  const { user } = useAuth();
  const { showError } = useSnackbar();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pull-to-refresh state
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const touchStartY = useRef(0);
  const scrollContainerRef = useRef(null);
  
  // Notification menu state
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const isNotifOpen = Boolean(notifAnchorEl);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchPosts();
    const fetchCount = async () => {
      try {
        const res = await notificationService.getNotifications();
        setUnreadCount(res.unreadCount || 0);
      } catch (err) {
        console.error('Failed to fetch unread count', err);
      }
    };
    fetchCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await postService.getFeedPosts();
      setPosts(data.posts);
    } catch (error) {
      console.error('Failed to load feed:', error);
      showError('Failed to load posts.');
    } finally {
      setLoading(false);
    }
  };

  // Pull-to-refresh: silently re-fetch without full-page loader
  const handleNotifClick = (e) => setNotifAnchorEl(e.currentTarget);
  const handleNotifClose = () => {
    setNotifAnchorEl(null);
    setUnreadCount(0);
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await postService.getFeedPosts();
      setPosts(data.posts);
    } catch (error) {
      console.error('Refresh failed:', error);
      showError('Failed to refresh posts.');
    } finally {
      setRefreshing(false);
      setPullDistance(0);
    }
  }, [showError]);

  // Touch handlers for pull-to-refresh
  const handleTouchStart = (e) => {
    // Only activate if scrolled to the very top
    if (window.scrollY <= 0) {
      touchStartY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e) => {
    if (!isPulling || refreshing) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;
    if (diff > 0 && window.scrollY <= 0) {
      // Dampen the pull so it feels elastic
      setPullDistance(Math.min(diff * 0.4, PULL_THRESHOLD + 30));
    }
  };

  const handleTouchEnd = () => {
    if (!isPulling) return;
    setIsPulling(false);
    if (pullDistance >= PULL_THRESHOLD && !refreshing) {
      handleRefresh();
    } else {
      setPullDistance(0);
    }
  };

  const handleLike = async (postId) => {
    try {
      const data = await postService.likePost(postId);
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId ? { ...post, likes: data.likes } : post
        )
      );
    } catch (error) {
      console.error('Like error:', error);
      showError('Failed to like post.');
    }
  };

  return (
    <Box
      ref={scrollContainerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      sx={{ width: '100%', maxWidth: '100vw', overflowX: 'hidden', position: 'relative' }}
    >
      {/* Pull-to-refresh indicator */}
      <AnimatePresence>
        {(pullDistance > 0 || refreshing) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: refreshing ? 48 : pullDistance, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFBFC' }}
          >
            {refreshing ? (
              <Box sx={{ width: '100%' }}>
                <LinearProgress
                  sx={{
                    height: 3,
                    backgroundColor: '#FFE0EB',
                    '& .MuiLinearProgress-bar': { backgroundColor: '#FA587D' },
                  }}
                />
                <Typography sx={{ textAlign: 'center', fontSize: '0.8rem', color: '#A0A0A0', py: 1 }}>
                  Refreshing...
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 1 }}>
                <motion.div
                  animate={{ rotate: pullDistance >= PULL_THRESHOLD ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Typography sx={{ fontSize: '1.2rem' }}>
                    {pullDistance >= PULL_THRESHOLD ? '🔄' : '⬇️'}
                  </Typography>
                </motion.div>
                <Typography sx={{ fontSize: '0.75rem', color: '#A0A0A0', mt: 0.5 }}>
                  {pullDistance >= PULL_THRESHOLD ? 'Release to refresh' : 'Pull down to refresh'}
                </Typography>
              </Box>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* App Bar (Mobile Only) */}
      <Box sx={{
        display: { xs: 'flex', md: 'none' }, // Added to hide on desktop
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        pt: 2,
        pb: 1.5,
        bgcolor: '#FFFFFF', // Revert to White
        borderBottom: '1px solid #F0F0F0',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        {/* Brand Logo Image */}
<Box
  component="img"
  src="/app-logo/header-logo.png"
  alt="SocialX"
  sx={{
    height: { xs: 28, sm: 32, md: 36 }, // ✅ reduced to proper logo scale
    width: "auto",
    objectFit: "contain",
    display: "block",

    // ✨ makes logo crisp
    imageRendering: "auto",

    // ✨ slight visual polish (optional but nice)
    filter: "contrast(1.05) saturate(1.1)",

    // ✨ prevents weird stretching
    maxWidth: "140px",
  }}
/>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ position: 'relative' }}>
            <IconButton sx={{ color: '#1A1A1A' }} onClick={handleNotifClick}>
              <NotificationsNoneRoundedIcon />
            </IconButton>
            {unreadCount > 0 && (
              <Box sx={{
                position: 'absolute', top: -2, right: -2, 
                minWidth: 16, height: 16, borderRadius: '50%',
                bgcolor: '#FA587D', color: '#FFF', border: '2px solid #FFF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.6rem', fontWeight: 800
              }}>
                {unreadCount}
              </Box>
            )}
            <NotificationMenu 
              anchorEl={notifAnchorEl} 
              open={isNotifOpen} 
              onClose={handleNotifClose} 
              onMarkRead={() => setUnreadCount(0)}
            />
          </Box>
          <Avatar src={user?.avatar} sx={{ width: 40, height: 40, ml: 1, border: '2px solid #FAFBFC', objectFit: 'cover' }} />
        </Box>
      </Box>

      {/* Posts */}
      <Box sx={{ px: 2, pb: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: '#FA587D' }} />
          </Box>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <PostCard post={post} currentUserId={user?._id || user?.id} onLike={handleLike} />
            </motion.div>
          ))
        ) : (
          <Box sx={{ textAlign: 'center', py: 10, color: '#A0A0A0' }}>
            <Typography variant="h6">No posts yet!</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>Follow people to see their posts here.</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Feed;
