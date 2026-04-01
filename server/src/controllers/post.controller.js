const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.createPost = async (req, res) => {
  try {
    const { content, visibility } = req.body;
    let images = [];

    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => ({
        url: `/uploads/${file.filename}`,
      }));
    }

    if (!content && images.length === 0) {
      return res.status(400).json({ success: false, message: 'Post cannot be empty.' });
    }

    const newPost = await Post.create({
      user: req.user.id,
      content,
      images,
      visibility: visibility || 'public',
    });

    const populatedPost = await Post.findById(newPost._id)
      .populate('user', 'fullName username email avatar')
      .exec();

    // Notify subscribers
    const currentUser = await User.findById(req.user.id);
    if (currentUser.subscribers && currentUser.subscribers.length > 0) {
      const notifications = currentUser.subscribers.map(subId => ({
        recipient: subId,
        sender: req.user.id,
        type: 'new_post',
        post: newPost._id
      }));
      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      success: true,
      message: 'Post created successfully.',
      post: populatedPost,
    });
  } catch (error) {
    console.error('Create Post Error:', error);
    res.status(500).json({ success: false, message: 'Server error creating post.' });
  }
};

exports.getFeedPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Fetch posts from other users (exclude current user)
    // For now, since "friends/connections" are disabled, fetch all public posts from other users
    const query = { user: { $ne: req.user.id }, visibility: 'public' };

    const posts = await Post.find(query)
      .populate('user', 'fullName username email avatar')
      .populate('comments.user', 'fullName username email avatar')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    console.error('Get Feed Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching feed.' });
  }
};

exports.getUserPosts = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Fetch posts created by the specific user
    const posts = await Post.find({ user: userId })
      .populate('user', 'fullName username email avatar')
      .populate('comments.user', 'fullName username email avatar')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    console.error('Get User Posts Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching user posts.' });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    if (post.likes.includes(req.user.id)) {
      post.likes.pull(req.user.id);
    } else {
      post.likes.push(req.user.id);
      
      // Notify post author if not liking own post
      if (post.user.toString() !== req.user.id) {
        await Notification.create({
          recipient: post.user,
          sender: req.user.id,
          type: 'like',
          post: post._id
        });
      }
    }

    await post.save();

    res.status(200).json({ success: true, likes: post.likes });
  } catch (error) {
    console.error('Like Post Error:', error);
    res.status(500).json({ success: false, message: 'Server error liking post.' });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    post.content = req.body.content || post.content;
    await post.save();
    res.status(200).json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating post.' });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    await post.deleteOne();
    res.status(200).json({ success: true, message: 'Post deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting post.' });
  }
};

exports.addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    if (!req.body.text) return res.status(400).json({ success: false, message: 'Comment text required.' });

    const newComment = {
      user: req.user.id,
      text: req.body.text
    };
    
    post.comments.push(newComment);
    await post.save();

    // Notify post author
    if (post.user.toString() !== req.user.id) {
      await Notification.create({
        recipient: post.user,
        sender: req.user.id,
        type: 'comment',
        post: post._id
      });
    }

    const populatedPost = await Post.findById(req.params.postId)
      .populate('comments.user', 'fullName username email avatar');

    res.status(200).json({ success: true, comments: populatedPost.comments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error adding comment.' });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found.' });

    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const twoMinutesInMs = 2 * 60 * 1000;
    const now = Date.now();
    const commentTime = new Date(comment.createdAt).getTime();

    if (now - commentTime > twoMinutesInMs) {
      return res.status(400).json({ success: false, message: 'Comments can only be edited within 2 minutes of posting.' });
    }

    comment.text = req.body.text || comment.text;
    await post.save();

    const populatedPost = await Post.findById(req.params.postId)
      .populate('comments.user', 'fullName username email avatar');

    res.status(200).json({ success: true, comments: populatedPost.comments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating comment.' });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found.' });

    if (comment.user.toString() !== req.user.id && post.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    comment.deleteOne();
    await post.save();

    const populatedPost = await Post.findById(req.params.postId)
      .populate('comments.user', 'fullName username email avatar');

    res.status(200).json({ success: true, comments: populatedPost.comments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting comment.' });
  }
};
