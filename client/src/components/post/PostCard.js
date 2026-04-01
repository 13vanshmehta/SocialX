import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, IconButton, Menu, MenuItem, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Slide, useTheme, useMediaQuery } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import IosShareRoundedIcon from '@mui/icons-material/IosShareRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import PublicIcon from '@mui/icons-material/Public';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import { API_BASE_URL } from '../../config/api';
import postService from '../../services/postService';
import userService from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { useSnackbar } from '../../context/SnackbarContext';

const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const renderContent = (content) => {
  if (!content) return null;
  const parts = content.split(/(#[a-zA-Z0-9_]+)/g);
  return parts.map((part, index) => {
    if (part.startsWith('#')) {
      return (
        <Box component="span" key={index} sx={{ color: '#0984E3', fontWeight: 500, cursor: 'pointer' }}>
          {part}
        </Box>
      );
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
};

const PostCard = ({ post: initialPost, onLike, onDeletePost }) => {
  const { user, updateUser } = useAuth();
  const { showError } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [post, setPost] = useState(initialPost);
  useEffect(() => { setPost(initialPost); }, [initialPost]);

  const currentUserId = user?.id || user?._id;
  const isOwner = currentUserId === (post.user?._id || post.user);
  
  const isLiked = post.likes?.includes(currentUserId);
  const likeCount = post.likes?.length || 0;
  const commentCount = post.comments?.length || 0;

  const serverUrl = API_BASE_URL.replace('/api', '');

  // Menu State
  const [anchorEl, setAnchorEl] = useState(null);
  const handleMenuClick = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // Edit Post State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editContent, setEditContent] = useState("");

  // Comment State
  const [showComments, setShowComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");

  const targetUserId = post.user?._id || post.user;
  const isSubscribed = user?.subscribedTo?.includes(targetUserId);

  // --- COMMENT MENU ACTIONS ---
  const [commentMenuAnchor, setCommentMenuAnchor] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const pressTimer = React.useRef(null);

  const handleCommentPressStart = (e, comment) => {
    // Only allow for comment author
    const commentOwnerId = comment.user?._id || comment.user;
    if (commentOwnerId !== currentUserId) return;
    
    const target = e.currentTarget;
    
    // Prevent default context menu on mobile long press
    if (e.type === 'contextmenu') {
      e.preventDefault();
      setSelectedComment(comment);
      setCommentMenuAnchor(target);
      return;
    }

    pressTimer.current = setTimeout(() => {
      setSelectedComment(comment);
      setCommentMenuAnchor(target);
    }, 500); // reduced to 500ms
  };

  const handleCommentPressEnd = (e) => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  const isWithinEditWindow = (createdAt) => {
    const diff = Date.now() - new Date(createdAt).getTime();
    return diff < 120000; // 2 minutes
  };

  // --- POST ACTIONS ---
  const handleEditClick = () => {
    setEditContent(post.content);
    setIsEditModalOpen(true);
    handleMenuClose();
  };

  const handleUpdatePost = async () => {
    try {
      const updated = await postService.updatePost(post._id, editContent);
      setPost({...post, content: updated.post.content});
      setIsEditModalOpen(false);
    } catch {
      showError('Failed to update post');
    }
  };

  const handleDeletePostClick = async () => {
    handleMenuClose();
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postService.deletePost(post._id);
        if (onDeletePost) onDeletePost(post._id);
      } catch {
        showError('Failed to delete post');
      }
    }
  };

  const handleToggleSubscription = async () => {
    try {
      const res = await userService.toggleNotifications(targetUserId);
      if (updateUser && user) {
        updateUser({ ...user, subscribedTo: res.subscribedTo });
      }
    } catch {
      showError('Failed to toggle notifications');
    }
    handleMenuClose();
  };

  // --- COMMENT ACTIONS ---
  const handleAddComment = async () => {
    if (!newCommentText.trim()) return;
    try {
      const res = await postService.addComment(post._id, newCommentText);
      setPost({ ...post, comments: res.comments });
      setNewCommentText("");
    } catch {
      showError('Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Delete this comment?')) {
      try {
        const res = await postService.deleteComment(post._id, commentId);
        setPost({ ...post, comments: res.comments });
      } catch {
        showError('Failed to delete comment');
      }
    }
  };

  const handleUpdateComment = async (commentId) => {
    try {
      const res = await postService.updateComment(post._id, commentId, editCommentText);
      setPost({ ...post, comments: res.comments });
      setEditCommentId(null);
    } catch (err) {
      if (err.response?.status === 400) {
        showError(err.response.data.message || 'Comments can only be edited within 2 minutes of posting.');
      } else {
        showError('Failed to update comment');
      }
    }
  };

  return (
    <Box sx={{ backgroundColor: '#FFFFFF', borderRadius: '24px', p: 2.5, mb: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.04)' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar src={post.user?.avatar} sx={{ width: 48, height: 48, mr: 1.5 }} />
        <Box sx={{ flexGrow: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#1A1A1A' }}>
            {post.user?.fullName || 'Anonymous'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', color: '#A0A0A0', fontSize: '0.8rem', mt: 0.3 }}>
            <Typography variant="caption" sx={{ mr: 0.5, fontWeight: 500 }}>
              {formatTime(post.createdAt)}
            </Typography>
            <Box component="span" sx={{ mx: 0.5 }}>•</Box>
            <PublicIcon sx={{ fontSize: 12 }} />
          </Box>
        </Box>
        <IconButton sx={{ color: '#1A1A1A' }} onClick={handleMenuClick}>
          <MoreHorizIcon />
        </IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          {isOwner ? [
            <MenuItem key="edit" onClick={handleEditClick}>Edit Post</MenuItem>,
            <MenuItem key="delete" onClick={handleDeletePostClick} sx={{ color: 'error.main' }}>Delete Post</MenuItem>
          ] : [
            <MenuItem key="notify" onClick={handleToggleSubscription}>
              {isSubscribed ? `Turn off notifications for ${post.user?.fullName}` : `Turn on notifications for ${post.user?.fullName}`}
            </MenuItem>
          ]}
        </Menu>
      </Box>

      {/* Content Text */}
      <Typography sx={{ color: '#333', fontSize: '1rem', mb: 2, lineHeight: 1.5, wordBreak: 'break-word' }}>
        {renderContent(post.content)}
      </Typography>

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, mb: 2, borderRadius: '20px', overflow: 'hidden', maxHeight: 300 }}>
          {post.images.map((img, index) => (
            <Box key={index} component="img" src={img.url.startsWith('http') ? img.url : `${serverUrl}${img.url}`} sx={{ flex: 1, width: '100%', height: '100%', objectFit: 'cover', minHeight: 200 }} />
          ))}
        </Box>
      )}

      {/* Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', pt: 1, borderTop: '1px solid #F6F6F6' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 3, cursor: 'pointer' }} onClick={() => onLike(post._id)}>
          {isLiked ? <FavoriteIcon sx={{ color: '#FA587D', fontSize: 24, mr: 0.5 }} /> : <FavoriteBorderOutlinedIcon sx={{ color: '#A0A0A0', fontSize: 24, mr: 0.5 }} />}
          <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: isLiked ? '#1A1A1A' : '#A0A0A0' }}>
            {likeCount > 0 ? `${likeCount} Likes` : 'Like'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, cursor: 'pointer' }} onClick={() => setShowComments(!showComments)}>
          <ChatBubbleOutlineRoundedIcon sx={{ color: '#A0A0A0', fontSize: 24, mr: 0.5 }} />
          <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#A0A0A0' }}>
            {commentCount > 0 ? `${commentCount} Comments` : 'Comment'}
          </Typography>
        </Box>
        <IconButton sx={{ color: '#1A1A1A', mr: 0.5 }}><IosShareRoundedIcon sx={{ fontSize: 22 }} /></IconButton>
        <IconButton sx={{ color: '#1A1A1A' }}><BookmarkBorderRoundedIcon sx={{ fontSize: 24 }} /></IconButton>
      </Box>

      {/* Comments Thread Dialog */}
      <Dialog
        open={showComments}
        onClose={() => setShowComments(false)}
        fullScreen={isMobile}
        fullWidth
        maxWidth="sm"
        TransitionComponent={Transition}
        keepMounted
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : '24px',
            bgcolor: '#FFF',
            maxHeight: isMobile ? '100%' : '85vh',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        {/* Header */}
        <DialogTitle sx={{ m: 0, p: 2, textAlign: 'center', borderBottom: '1px solid #F0F0F0', bgcolor: '#FFF' }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#1A1A1A' }}>Comments</Typography>
          <IconButton
            onClick={() => setShowComments(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: '#A0A0A0',
            }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: '24px 16px', flexGrow: 1, overflowY: 'auto', bgcolor: '#FFF' }}>
          {/* List existing comments */}
          {post.comments && post.comments.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {post.comments.map((comment) => (
                <Box 
                  key={comment._id} 
                  onMouseDown={(e) => handleCommentPressStart(e, comment)}
                  onMouseUp={handleCommentPressEnd}
                  onMouseLeave={handleCommentPressEnd}
                  onTouchStart={(e) => handleCommentPressStart(e, comment)}
                  onTouchEnd={handleCommentPressEnd}
                  onContextMenu={(e) => handleCommentPressStart(e, comment)}
                  sx={{ 
                    display: 'flex', 
                    p: 1.5, borderRadius: 2,
                    cursor: (comment.user?._id || comment.user) === currentUserId ? 'pointer' : 'default',
                    transition: 'background-color 0.2s',
                    userSelect: 'none', // Prevent text selection on long press
                    '&:active': { bgcolor: (comment.user?._id || comment.user) === currentUserId ? 'rgba(250, 88, 125, 0.08)' : 'transparent' }
                  }}
                >
                  <Avatar src={comment.user?.avatar} sx={{ width: 40, height: 40, mr: 1.5 }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A1A1A' }}>
                        {comment.user?.fullName || 'User'}
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#A0A0A0', fontWeight: 500 }}>
                        {formatTime(comment.createdAt)}
                      </Typography>
                      {(comment.user?._id || comment.user) === currentUserId && (
                        <Typography sx={{ fontSize: '0.65rem', color: '#FA587D', opacity: 0.7 }}>
                          (Long press to edit)
                        </Typography>
                      )}
                    </Box>
                    
                    {editCommentId === comment._id ? (
                      <Box sx={{ mt: 1 }}>
                        <TextField 
                          size="small" fullWidth multiline maxRows={3} 
                          value={editCommentText} onChange={(e) => setEditCommentText(e.target.value)} 
                          autoFocus 
                          sx={{ 
                            bgcolor: '#F9F9F9', 
                            borderRadius: 1,
                            '& .MuiInputBase-input': { color: '#1A1A1A' }
                          }} 
                        />
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Button size="small" variant="contained" sx={{ bgcolor: '#FA587D', '&:hover': { bgcolor: '#E04163' }, borderRadius: '20px', textTransform: 'none', boxShadow: 'none' }} onClick={() => handleUpdateComment(comment._id)}>Save</Button>
                          <Button size="small" sx={{ color: '#A0A0A0', textTransform: 'none' }} onClick={() => setEditCommentId(null)}>Cancel</Button>
                        </Box>
                      </Box>
                    ) : (
                      <Typography sx={{ fontSize: '0.95rem', color: '#333', wordBreak: 'break-word', lineHeight: 1.4 }}>
                        {comment.text}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography sx={{ fontSize: '1rem', color: '#A0A0A0', fontWeight: 500 }}>No comments yet.<br/>Start the conversation!</Typography>
            </Box>
          )}
        </DialogContent>

        {/* Add a comment Footer */}
        <Box sx={{ p: 2, borderTop: '1px solid #F0F0F0', bgcolor: '#FFF', flexShrink: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar src={user?.avatar} sx={{ width: 36, height: 36, mr: 1.5 }} />
            <TextField 
              fullWidth placeholder="Add a comment..." size="small"
              value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter' && newCommentText.trim()) handleAddComment(); }}
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: '24px', 
                  bgcolor: '#F9F9F9', 
                  fontSize: '0.95rem',
                  color: '#1A1A1A', // ✅ Text visibility
                  '& fieldset': { borderColor: 'transparent' },
                  '&:hover fieldset': { borderColor: 'transparent' },
                  '&.Mui-focused fieldset': { borderColor: '#FA587D' },
                  '& input': { 
                    color: '#1A1A1A !important', // ✅ Force input color
                    WebkitTextFillColor: '#1A1A1A !important' // ✅ Handle Safari/Chrome fill
                  }
                } 
              }}
            />
            <Button 
              onClick={handleAddComment} 
              disabled={!newCommentText.trim()}
              sx={{ 
                minWidth: 'auto', 
                ml: 1, 
                fontWeight: 600, 
                color: '#FA587D', 
                textTransform: 'none',
                fontSize: '1rem',
                '&.Mui-disabled': { color: '#FFB3C6' } 
              }}
            >
              Post
            </Button>
          </Box>
        </Box>
        {/* Long Press Comment Menu */}
        <Menu
          anchorEl={commentMenuAnchor}
          open={Boolean(commentMenuAnchor)}
          onClose={() => setCommentMenuAnchor(null)}
          slotProps={{ paper: { sx: { borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' } } }}
        >
          {selectedComment && isWithinEditWindow(selectedComment.createdAt) && (
            <MenuItem onClick={() => {
              setEditCommentId(selectedComment._id);
              setEditCommentText(selectedComment.text);
              setCommentMenuAnchor(null);
            }} sx={{ gap: 1.5, py: 1.2 }}>
              Update (Within 2m)
            </MenuItem>
          )}
          <MenuItem onClick={() => {
            handleDeleteComment(selectedComment._id);
            setCommentMenuAnchor(null);
          }} sx={{ color: '#FA587D', gap: 1.5, py: 1.2 }}>
            Delete Forever
          </MenuItem>
        </Menu>
      </Dialog>

      {/* Edit Post Modal */}
      <Dialog open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Post</DialogTitle>
        <DialogContent>
          <TextField
            multiline rows={4} fullWidth variant="outlined" margin="normal"
            value={editContent} onChange={(e) => setEditContent(e.target.value)}
            sx={{ '& .MuiInputBase-input': { color: '#1A1A1A' } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsEditModalOpen(false)} sx={{ color: '#A0A0A0' }}>Cancel</Button>
          <Button onClick={handleUpdatePost} variant="contained" sx={{ bgcolor: '#FA587D', borderRadius: '8px', '&:hover': { bgcolor: '#E04163' } }}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PostCard;
