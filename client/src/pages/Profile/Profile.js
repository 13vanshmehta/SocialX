import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Box, Typography, Avatar, IconButton, Button, CircularProgress, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { motion } from 'framer-motion';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';

import PostCard from '../../components/post/PostCard';
import postService from '../../services/postService';
import userService from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { useSnackbar } from '../../context/SnackbarContext';

const Profile = () => {
  const { user, logout } = useAuth();
  const { showSuccess, showError } = useSnackbar();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [totalPosts, setTotalPosts] = useState(0);

  const [settingsAnchor, setSettingsAnchor] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const observerRef = useRef();

  const lastPostElementRef = useCallback(node => {
    if (loading || isFetchingNextPage) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });

    if (node) observerRef.current.observe(node);
  }, [loading, isFetchingNextPage, hasMore]);

  const handleLogout = () => {
    setSettingsAnchor(null);
    logout();
    showSuccess('Successfully logged out.');
  };

  const handleDeleteAccount = () => {
    setSettingsAnchor(null);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteAccount = async () => {
    try {
      await userService.deleteAccount();
      setDeleteDialogOpen(false);
      logout();
      showSuccess('Account deleted successfully.');
    } catch (error) {
      showError('Failed to delete account.');
      setDeleteDialogOpen(false);
    }
  };

  useEffect(() => {
    fetchUserPosts(page, page > 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchUserPosts = async (pageNum, isLoadMore = false) => {
    try {
      if (isLoadMore) setIsFetchingNextPage(true);
      else setLoading(true);

      const data = await postService.getUserPosts(null, pageNum, 10); 
      
      if (isLoadMore) {
        setPosts((prev) => [...prev, ...data.posts]);
      } else {
        setPosts(data.posts);
      }
      setTotalPosts(data.total);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Failed to load profile posts:', error);
      showError('Failed to load your posts.');
    } finally {
      setLoading(false);
      setIsFetchingNextPage(false);
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
    <Box sx={{ width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      
      {/* App Bar (Mobile Only) */}
      <Box sx={{ 
        display: { xs: 'flex', md: 'none' }, alignItems: 'center', justifyContent: 'space-between', 
        px: 2, pt: 2, pb: 1, bgcolor: '#FFFFFF',
        borderBottom: '1px solid #F0F0F0',
        position: 'sticky', top: 0, zIndex: 10
      }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#1A1A1A' }}>
          Profile
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ position: 'relative' }}>
            <IconButton sx={{ color: '#1A1A1A' }}><NotificationsNoneRoundedIcon /></IconButton>
            <Box sx={{
              position: 'absolute', top: 8, right: 8, width: 8, height: 8, 
              bgcolor: '#FA587D', borderRadius: '50%', border: '2px solid #FFF'
            }} />
          </Box>
          <IconButton sx={{ color: '#1A1A1A' }}><MenuRoundedIcon /></IconButton>
        </Box>
      </Box>

      <Box sx={{ px: 2, pt: 2, bgcolor: '#FFFFFF' }}>
        {/* User Card */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar src={user?.avatar} sx={{ width: 80, height: 80, mr: 2, border: '2px solid #F8F8F8' }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#1A1A1A', display: 'flex', alignItems: 'center' }}>
              {user?.fullName || 'User'} <VerifiedRoundedIcon sx={{ fontSize: 18, ml: 0.5, color: '#0984E3' }} />
            </Typography>
          </Box>
          <IconButton sx={{ 
            bgcolor: '#FAFBFC', border: '1px solid #E0E0E0', 
            borderRadius: '50%', p: 1.2, ml: 1 
          }}>
             <Typography sx={{ fontSize: '1.2rem' }}>💬</Typography>
          </IconButton>
        </Box>

        <Box sx={{ mb: 2 }}>
          {user?.bio && (
            <Typography sx={{ color: '#1A1A1A', fontSize: '0.95rem', mb: 1.5, whiteSpace: 'pre-line' }}>
              {user.bio}
            </Typography>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
             <Button
                fullWidth
                sx={{
                  borderRadius: '8px', textTransform: 'none', fontWeight: 600,
                  fontSize: '0.9rem', color: '#1A1A1A', bgcolor: '#F5F5F5',
                  '&:hover': { bgcolor: '#EEEEEE' }
                }}
             >
                Edit profile
             </Button>
             <Button
                fullWidth
                onClick={(e) => setSettingsAnchor(e.currentTarget)}
                sx={{
                  borderRadius: '8px', textTransform: 'none', fontWeight: 600,
                  fontSize: '0.9rem', color: '#1A1A1A', bgcolor: '#F5F5F5',
                  '&:hover': { bgcolor: '#EEEEEE' }
                }}
             >
                Settings
             </Button>
             <Menu
               anchorEl={settingsAnchor}
               open={Boolean(settingsAnchor)}
               onClose={() => setSettingsAnchor(null)}
               PaperProps={{ sx: { borderRadius: '12px', minWidth: 160 } }}
             >
               <MenuItem onClick={handleLogout} sx={{ gap: 1.5, py: 1.2 }}>
                  Logout
               </MenuItem>
               <MenuItem onClick={handleDeleteAccount} sx={{ gap: 1.5, py: 1.2, color: 'error.main' }}>
                  Delete Account
               </MenuItem>
             </Menu>
          </Box>
        </Box>

        {/* Stats */}
        <Box sx={{ 
          display: 'flex', border: '1px solid #F0F0F0', borderRadius: '16px', 
          py: 2, mb: 3, bgcolor: '#FFFFFF', boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
        }}>
          <Box sx={{ flex: 1, textAlign: 'center', borderRight: '1px solid #F0F0F0' }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#1A1A1A' }}>{totalPosts}</Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#A0A0A0' }}>Total Post</Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: 'center', borderRight: '1px solid #F0F0F0' }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#1A1A1A' }}>5.9K</Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#A0A0A0' }}>Followers</Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#1A1A1A' }}>126</Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#A0A0A0' }}>Following</Typography>
          </Box>
        </Box>

        {/* Content Tabs */}
        <Box sx={{ display: 'flex', borderBottom: '1px solid #F0F0F0', mb: 3 }}>
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', pb: 1.5, borderBottom: '3px solid #FA587D' }}>
             <GridViewRoundedIcon sx={{ color: '#FA587D' }} />
          </Box>
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', pb: 1.5 }}>
             <PlayCircleOutlineRoundedIcon sx={{ color: '#A0A0A0' }} />
          </Box>
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', pb: 1.5 }}>
             <BookmarkBorderRoundedIcon sx={{ color: '#A0A0A0' }} />
          </Box>
        </Box>

      </Box>

      {/* Profile Posts List */}
      <Box sx={{ px: 2, pb: 4, bgcolor: '#FAFBFC' }}>
        {loading && posts.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
             <CircularProgress sx={{ color: '#FA587D' }} />
          </Box>
        ) : posts.length > 0 ? (
          <>
            {posts.map((post, index) => {
              if (posts.length === index + 1) {
                return (
                  <motion.div
                    key={post._id}
                    ref={lastPostElementRef}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PostCard post={post} currentUserId={user?._id || user?.id} onLike={handleLike} />
                  </motion.div>
                );
              } else {
                return (
                  <motion.div
                    key={post._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PostCard post={post} currentUserId={user?._id || user?.id} onLike={handleLike} />
                  </motion.div>
                );
              }
            })}
            
            {isFetchingNextPage && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={24} sx={{ color: '#FA587D' }} />
              </Box>
            )}
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8, color: '#A0A0A0' }}>
            <Typography variant="h6">No posts yet!</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>Create a post and it will appear here.</Typography>
          </Box>
        )}
      </Box>

      {/* Delete Account Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: '20px', p: 1, maxWidth: '400px' }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, textAlign: 'center', pt: 3 }}>
          Delete Account?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ textAlign: 'center', color: '#666' }}>
            Are you sure you want to delete your account? This action is permanent and all your data will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 3, pt: 1 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ 
              color: '#333', bgcolor: '#F5F5F5', px: 3, borderRadius: '10px',
              textTransform: 'none', fontWeight: 600,
              '&:hover': { bgcolor: '#EEEEEE' }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDeleteAccount}
            variant="contained"
            color="error"
            sx={{ 
              bgcolor: '#FF5252', px: 3, borderRadius: '10px',
              textTransform: 'none', fontWeight: 600,
              boxShadow: '0 4px 12px rgba(255, 82, 82, 0.2)',
              '&:hover': { bgcolor: '#FF3D3D' }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default Profile;
