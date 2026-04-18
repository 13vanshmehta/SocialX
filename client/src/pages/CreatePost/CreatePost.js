import React, { useState, useRef } from 'react';
import { Box, Typography, Avatar, IconButton, TextField, Button, CircularProgress, useTheme, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import MoodOutlinedIcon from '@mui/icons-material/MoodOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../config/constants';
import postService from '../../services/postService';
import { useSnackbar } from '../../context/SnackbarContext';

const CreatePost = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const { showSuccess, showError } = useSnackbar();

  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

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

      const formData = new FormData();
      formData.append('content', content);
      formData.append('visibility', 'public');
      images.forEach((img) => formData.append('images', img));

      await postService.createPost(formData);

      showSuccess('Post created successfully! 🎉');
      navigate(ROUTES.PROFILE); // Re-route to profile so they can see their post

    } catch (error) {
      console.error('Create post failed:', error);
      showError('Failed to create post. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: theme.palette.background.default, display: 'flex', flexDirection: 'column' }}>
      
      {/* 1. Sleek Header */}
      <Box sx={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        px: 2, py: 1.5, position: 'sticky', top: 0, zIndex: 10,
        bgcolor: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <IconButton onClick={() => navigate(ROUTES.FEED)}>
          <CloseRoundedIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: '1.1rem' }}>
          Create Post
        </Typography>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={isUploading || (!content.trim() && images.length === 0)}
          sx={{ 
            borderRadius: '20px', 
            background: isUploading || (!content.trim() && images.length === 0) ? theme.palette.action.disabledBackground : theme.palette.accent.gradient,
            color: '#fff',
            px: 3,
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: 'none',
            '&:disabled': {
              color: 'rgba(255, 255, 255, 0.7)',
            }
          }}
        >
          {isUploading ? <CircularProgress size={20} color="inherit" /> : 'Post'}
        </Button>
      </Box>

      {/* Loading strip */}
      {isUploading && (
        <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.5, repeat: Infinity }}>
          <Box sx={{ height: 3, background: theme.palette.accent.gradient }} />
        </motion.div>
      )}

      {/* Main Content Area */}
      <Box sx={{ px: 2, py: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>

        {/* 2. User Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar src={user?.avatar} sx={{ width: 44, height: 44, mr: 1.5 }} />
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: theme.palette.text.primary }}>
              {user?.fullName}
            </Typography>
            {/* Audience Selector */}
            <Box sx={{ 
              display: 'inline-flex', alignItems: 'center', px: 1, py: 0.25, mt: 0.5,
              borderRadius: '12px', border: `1px solid ${theme.palette.divider}`, cursor: 'pointer' 
            }}>
              <PublicOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary, mr: 0.5 }} />
              <Typography sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary, fontWeight: 500, mr: 0.5 }}>Public</Typography>
              <ExpandMoreRoundedIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
            </Box>
          </Box>
        </Box>

        {/* 3. Text Area */}
        <TextField
          fullWidth
          multiline
          minRows={3}
          placeholder="What's going on?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isUploading}
          variant="standard"
          InputProps={{
            disableUnderline: true,
            sx: { 
              fontSize: '1.25rem', 
              color: theme.palette.text.primary, 
              lineHeight: 1.5,
              pb: 2,
              '&::placeholder': { color: theme.palette.text.disabled }
            }
          }}
        />

        {/* 4. Media Preview Grid */}
        {previewUrls.length > 0 && (
          <Box sx={{ mb: 2, borderRadius: '16px', overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ 
              display: 'grid', 
              gap: '2px',
              gridTemplateColumns: previewUrls.length === 1 ? '1fr' : '1fr 1fr',
              gridTemplateRows: previewUrls.length >= 3 ? '1fr 1fr' : '1fr',
            }}>
              {previewUrls.map((url, index) => {
                let gridSpan = {};
                if (previewUrls.length === 3 && index === 0) gridSpan = { gridRow: 'span 2' };
                return (
                  <Box key={index} sx={{ position: 'relative', width: '100%', paddingTop: previewUrls.length === 1 ? '75%' : '100%', ...gridSpan }}>
                    <Box component="img" src={url} sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    <IconButton 
                      onClick={() => removeImage(index)}
                      size="small"
                      sx={{ 
                        position: 'absolute', top: 8, right: 8, 
                        bgcolor: 'rgba(0,0,0,0.6)', color: '#FFF', 
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                        backdropFilter: 'blur(4px)'
                      }}
                    >
                      <CloseRoundedIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>
                );
              })}
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

      </Box>

      {/* 5. ToolBar at bottom (above keyboard conceptually) */}
      <Box sx={{ px: 2, pb: 3, pt: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: theme.palette.text.secondary, mb: 1.5 }}>
          Add to your post
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Tooltip title="Photo/Video">
            <IconButton 
              onClick={() => fileInputRef.current?.click()} 
              disabled={isUploading || images.length >= 5}
              sx={{ color: theme.palette.primary.main, bgcolor: 'rgba(232,67,147,0.08)', '&:hover': { bgcolor: 'rgba(232,67,147,0.15)' } }}
            >
              <AddPhotoAlternateOutlinedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Tag People">
            <IconButton disabled={isUploading} sx={{ color: theme.palette.secondary.main, bgcolor: 'rgba(9,132,227,0.08)', '&:hover': { bgcolor: 'rgba(9,132,227,0.15)' } }}>
              <LocalOfferOutlinedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Feeling/Activity">
            <IconButton disabled={isUploading} sx={{ color: '#F5A623', bgcolor: 'rgba(245,166,35,0.08)', '&:hover': { bgcolor: 'rgba(245,166,35,0.15)' } }}>
              <MoodOutlinedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Check in">
            <IconButton disabled={isUploading} sx={{ color: '#E74C3C', bgcolor: 'rgba(231,76,60,0.08)', '&:hover': { bgcolor: 'rgba(231,76,60,0.15)' } }}>
              <LocationOnOutlinedIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

    </Box>
  );
};

export default CreatePost;
