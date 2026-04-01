import React, { useState, useRef } from 'react';
import { Box, Typography, Avatar, IconButton, TextField, Button, CircularProgress } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../config/constants';
import postService from '../../services/postService';
import { useSnackbar } from '../../context/SnackbarContext';

const CreatePost = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useSnackbar();

  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (images.length + files.length > 5) {
      showError('You can only upload up to 5 images.');
      return;
    }

    setImages([...images, ...files]);

    // Create preview URLs
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newPreviews]);
  };

  const removeImage = (indexToRemove) => {
    URL.revokeObjectURL(previewUrls[indexToRemove]);
    setImages(images.filter((_, index) => index !== indexToRemove));
    setPreviewUrls(previewUrls.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0) {
      showError('Please add text or an image to post.');
      return;
    }

    try {
      setIsUploading(true);
      // Faking progress for the UI effect seen in mockup
      let progress = 0;
      const interval = setInterval(() => {
        progress += 15;
        if (progress > 90) clearInterval(interval);
        setUploadProgress(Math.min(progress, 90));
      }, 100);

      const formData = new FormData();
      formData.append('content', content);
      formData.append('visibility', 'public');
      images.forEach((img) => formData.append('images', img));

      await postService.createPost(formData);

      clearInterval(interval);
      setUploadProgress(100);

      setTimeout(() => {
        setIsUploading(false);
        showSuccess('Post created successfully! 🎉');
        navigate(ROUTES.PROFILE); // Re-route to profile so they can see their post
      }, 500);

    } catch (error) {
      console.error('Create post failed:', error);
      setIsUploading(false);
      showError('Failed to create post. Please try again.');
    }
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', pb: 10, bgcolor: '#FFFFFF' }}>
      
      {/* Uploading Progress Bar (if active) */}
      <AnimatePresence>
        {isUploading && (
          <motion.div initial={{ y: -50 }} animate={{ y: 0 }} exit={{ y: -50 }}>
            <Box sx={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
              px: 3, py: 1.5, m: 2, bgcolor: '#FFF0F5', borderRadius: '16px' 
            }}>
              <Typography sx={{ color: '#FA587D', fontWeight: 600, fontSize: '0.9rem' }}>
                Post Uploading
              </Typography>
              <Typography sx={{ color: '#FA587D', fontWeight: 700 }}>
                {uploadProgress}% <ArrowUpwardRoundedIcon sx={{ fontSize: 16, verticalAlign: 'middle' }} />
              </Typography>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, pt: 2, pb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#1A1A1A' }}>
          Create Post
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ position: 'relative' }}>
            <IconButton sx={{ color: '#1A1A1A' }}><NotificationsNoneRoundedIcon /></IconButton>
            <Box sx={{
              position: 'absolute', top: 8, right: 8, width: 8, height: 8, 
              bgcolor: '#FA587D', borderRadius: '50%', border: '2px solid #FFF'
            }} />
          </Box>
        </Box>
      </Box>

      {/* User Info & Audience Selector */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar src={user?.avatar} sx={{ width: 48, height: 48, mr: 1.5 }} />
          <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#1A1A1A' }}>
            {user?.fullName}
          </Typography>
        </Box>

        <Box sx={{ 
          display: 'flex', alignItems: 'center', px: 1.5, py: 0.5, 
          borderRadius: '20px', border: '1px solid #E0E0E0', cursor: 'pointer' 
        }}>
          <PublicOutlinedIcon sx={{ fontSize: 16, color: '#A0A0A0', mr: 0.5 }} />
          <Typography sx={{ fontSize: '0.85rem', color: '#A0A0A0', fontWeight: 500, mr: 0.5 }}>Public</Typography>
          <ExpandMoreRoundedIcon sx={{ fontSize: 18, color: '#A0A0A0' }} />
        </Box>
      </Box>

      {/* Text Area */}
      <Box sx={{ px: 2, mb: 3 }}>
        <TextField
          fullWidth
          multiline
          minRows={3}
          maxRows={10}
          placeholder="Write something..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          variant="standard"
          disabled={isUploading}
          InputProps={{
            disableUnderline: true,
            sx: { fontSize: '1.05rem', color: '#1A1A1A', lineHeight: 1.6 }
          }}
        />
      </Box>

      {/* Image Previews */}
      {previewUrls.length > 0 && (
        <Box sx={{ px: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#1A1A1A' }}>
              Selected Images
            </Typography>
            <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#FA587D', cursor: 'pointer' }}>
              See More
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
             {previewUrls.map((url, index) => (
                <Box key={index} sx={{ position: 'relative', width: '48%', paddingTop: '48%', borderRadius: '16px', overflow: 'hidden' }}>
                   <Box component="img" src={url} sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                   <IconButton 
                     onClick={() => removeImage(index)}
                     sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.5)', color: '#FFF', p: 0.5, '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
                   >
                     <CloseRoundedIcon sx={{ fontSize: 16 }} />
                   </IconButton>
                </Box>
             ))}
          </Box>
        </Box>
      )}

      <input
        type="file"
        multiple
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleImageSelect}
        disabled={isUploading}
      />

      {/* Add Media Button */}
      <Box sx={{ px: 2, mb: 4 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          sx={{
            py: 1.5,
            borderRadius: '24px',
            borderColor: '#FA587D',
            color: '#FA587D',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '1rem',
            '&:hover': { backgroundColor: '#FFF0F5', borderColor: '#FA587D' }
          }}
        >
          Add more image +
        </Button>
      </Box>

      {/* Floating Action Menu row (Images) */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', px: 3, mb: 5 }}>
        <IconButton sx={{ color: '#FA587D', bgcolor: '#FFF0F5', p: 2, '&:hover': { bgcolor: '#FFE0EB' } }} onClick={() => fileInputRef.current?.click()}><ImageOutlinedIcon sx={{ fontSize: 32 }} /></IconButton>
      </Box>

      {/* Big Submit/Cancel Button Overlay */}
      <Box sx={{ position: 'fixed', bottom: 16, width: '100%', display: 'flex', justifyContent: 'center', zIndex: 1100 }}>
        {content || images.length > 0 ? (
          <Box
            onClick={!isUploading ? handleSubmit : null}
            sx={{
              width: 64, height: 64, borderRadius: '50%', bgcolor: isUploading ? '#E0E0E0' : '#FA587D', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              boxShadow: isUploading ? 'none' : '0 8px 20px rgba(250, 88, 125, 0.4)',
              transition: 'transform 0.2s', '&:active': { transform: 'scale(0.95)' }
            }}
          >
             {isUploading ? <CircularProgress size={28} sx={{ color: '#FFF' }} /> : <ArrowUpwardRoundedIcon sx={{ color: '#FFF', fontSize: 32 }} />}
          </Box>
        ) : (
          <Box
            onClick={() => navigate(ROUTES.FEED)}
            sx={{
              width: 64, height: 64, borderRadius: '50%', bgcolor: '#FA587D', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(250, 88, 125, 0.4)',
              transition: 'transform 0.2s', '&:active': { transform: 'scale(0.95)' }
            }}
          >
             <CloseRoundedIcon sx={{ color: '#FFF', fontSize: 32 }} />
          </Box>
        )}
      </Box>

    </Box>
  );
};

export default CreatePost;
