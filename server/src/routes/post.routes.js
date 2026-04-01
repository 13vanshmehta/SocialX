const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const authenticate = require('../middleware/authenticate');
const upload = require('../middleware/upload');

// All post routes require authentication
router.use(authenticate);

// Create a new post
router.post('/', upload.array('images', 5), postController.createPost);

// Get main feed (public posts from others)
router.get('/feed', postController.getFeedPosts);

// Get user specific posts (default to logged in user if ID not provided)
router.get('/user/:userId?', postController.getUserPosts);

// Like or unlike a post
router.put('/:postId/like', postController.likePost);

// Update post
router.put('/:postId', postController.updatePost);

// Delete post
router.delete('/:postId', postController.deletePost);

// Add comment
router.post('/:postId/comment', postController.addComment);

// Delete comment
router.delete('/:postId/comment/:commentId', postController.deleteComment);

// Update comment
router.put('/:postId/comment/:commentId', postController.updateComment);

module.exports = router;
