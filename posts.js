const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const auth = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');

// Create post
router.post('/', auth, upload.single('media'), async (req, res) => {
  try {
    const newPost = new Post({
      author: req.userId,
      text: req.body.text,
      media: req.file ? `/uploads/${req.file.filename}` : ''
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch {
    res.status(500).json({ error: 'Post creation failed' });
  }
});

// Get all posts
router.get('/', auth, async (req, res) => {
  const posts = await Post.find().populate('author', 'username profilePic').sort({ createdAt: -1 });
  res.json(posts);
});

// Like/Unlike a post
router.put('/like/:postId', auth, async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const index = post.likes.indexOf(req.userId);
  if (index === -1) {
    post.likes.push(req.userId);
  } else {
    post.likes.splice(index, 1);
  }
  await post.save();
  res.json(post);
});

// Add comment
router.post('/comment/:postId', auth, async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  post.comments.push({
    user: req.userId,
    text: req.body.text
  });
  await post.save();
  res.json(post);
});
