import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar, IconButton, Button, CircularProgress } from '@mui/material';
import { motion } from 'motion/react';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';

import PostCard from '../../components/post/PostCard';
import postService from '../../services/postService';
import { useAuth } from '../../context/AuthContext';
import { useSnackbar } from '../../context/SnackbarContext';

const Profile = () => {
  const { user } = useAuth();
  const { showError } = useSnackbar();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    fetchUserPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      // Fetch specifically user's posts
      const data = await postService.getUserPosts(); 
      setPosts(data.posts);
    } catch (error) {
      console.error('Failed to load profile posts:', error);
      showError('Failed to load your posts.');
    } finally {
      setLoading(false);
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
                sx={{
                  borderRadius: '8px', textTransform: 'none', fontWeight: 600,
                  fontSize: '0.9rem', color: '#1A1A1A', bgcolor: '#F5F5F5',
                  '&:hover': { bgcolor: '#EEEEEE' }
                }}
             >
                Settings
             </Button>
          </Box>
        </Box>

        {/* Stats */}
        <Box sx={{ 
          display: 'flex', border: '1px solid #F0F0F0', borderRadius: '16px', 
          py: 2, mb: 3, bgcolor: '#FFFFFF', boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
        }}>
          <Box sx={{ flex: 1, textAlign: 'center', borderRight: '1px solid #F0F0F0' }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#1A1A1A' }}>{posts.length}</Typography>
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
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
             <CircularProgress sx={{ color: '#FA587D' }} />
          </Box>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <PostCard post={post} currentUserId={user?._id || user?.id} onLike={handleLike} />
            </motion.div>
          ))
        ) : (
          <Box sx={{ textAlign: 'center', py: 8, color: '#A0A0A0' }}>
            <Typography variant="h6">No posts yet!</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>Create a post and it will appear here.</Typography>
          </Box>
        )}
      </Box>

    </Box>
  );
};

export default Profile;
