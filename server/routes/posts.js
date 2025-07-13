// posts.js - Express routes for blog posts (including comments and replies)

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const Post = require('../models/Post');
const User = require('../models/User');

// GET /api/posts - Get all posts with pagination, search, and filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const category = req.query.category || null;
    const filter = {};
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }
    if (category) {
      filter.category = category;
    }
    // Populate author with username, name, and email
    const posts = await Post.find(filter)
      .populate('category')
      .populate('author', 'username name email')
      .skip((page - 1) * limit)
      .limit(limit);

    // Attach latest comment to each post
    const postsWithLatestComment = posts.map(post => {
      const latestComment = (post.comments && post.comments.length > 0)
        ? post.comments[post.comments.length - 1]
        : null;
      return {
        ...post.toObject(),
        latestComment,
      };
    });

    const total = await Post.countDocuments(filter);
    res.json({ posts: postsWithLatestComment, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// POST /api/posts - Create a new post (protected, with image upload)
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, content, category } = req.body;
    if (!req.file) return res.status(400).json({ error: 'Image is required' });
    const post = new Post({
      title,
      content,
      category,
      author: req.user.userId,
      image: req.file.filename,
      slug: title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-')
    });
    await post.save();
    res.status(201).json({ post });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- COMMENTS & REPLIES SECTION ---

// POST /api/posts/:id/comments - Add a comment to a post (protected)
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    let username = req.user.username;
    if (!username) {
      const user = await User.findById(req.user.userId);
      username = user ? user.username : 'Unknown';
    }

    const comment = {
      user: req.user.userId,
      username,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
      replies: []
    };
    post.comments.push(comment);
    await post.save();
    res.status(201).json({ comment: post.comments[post.comments.length - 1] });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/posts/:postId/comments/:commentId/replies - Add a reply to a comment (protected)
router.post('/:postId/comments/:commentId/replies', auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    let username = req.user.username;
    if (!username) {
      const user = await User.findById(req.user.userId);
      username = user ? user.username : 'Unknown';
    }

    const reply = {
      user: req.user.userId,
      username,
      content,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    comment.replies = comment.replies || [];
    comment.replies.push(reply);
    await post.save();
    res.status(201).json({ reply: comment.replies[comment.replies.length - 1] });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/posts/:postId/comments/:commentId - Edit a comment (protected)
router.put('/:postId/comments/:commentId', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    if (comment.user.toString() !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized to edit this comment' });
    }

    comment.content = content;
    comment.updatedAt = new Date();
    await post.save();
    res.json({ comment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/posts/:postId/comments/:commentId/replies/:replyId - Edit a reply (protected)
router.put('/:postId/comments/:commentId/replies/:replyId', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    const reply = (comment.replies || []).id(req.params.replyId);
    if (!reply) return res.status(404).json({ error: 'Reply not found' });

    if (reply.user.toString() !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized to edit this reply' });
    }

    reply.content = content;
    reply.updatedAt = new Date();
    await post.save();
    res.json({ reply });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/posts/:postId/comments/:commentId - Delete a comment (protected)
router.delete('/:postId/comments/:commentId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    if (comment.user.toString() !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    comment.remove();
    await post.save();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/posts/:postId/comments/:commentId/replies/:replyId - Delete a reply (protected)
router.delete('/:postId/comments/:commentId/replies/:replyId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    const reply = (comment.replies || []).id(req.params.replyId);
    if (!reply) return res.status(404).json({ error: 'Reply not found' });

    if (reply.user.toString() !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete this reply' });
    }

    reply.remove();
    await post.save();
    res.json({ message: 'Reply deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- END COMMENTS & REPLIES SECTION ---

// PUT /api/posts/:id - Update a post (protected, only by author or admin, supports image upload)
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (req.user.isAdmin || post.author.toString() === req.user.userId) {
      const { title, content, category } = req.body;
      post.title = title;
      post.content = content;
      post.category = category;
      if (req.file) {
        post.image = req.file.filename;
      }
      await post.save();
      return res.json({ post });
    } else {
      return res.status(403).json({ error: 'Not authorized to edit this post' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/posts/:id - Delete a post (protected, only by author or admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (req.user.isAdmin || post.author.toString() === req.user.userId) {
      await post.deleteOne();
      return res.json({ message: 'Post deleted' });
    } else {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/posts/:id - Get a single post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('category')
      .populate('author', 'username name email');
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(400).json({ error: 'Invalid post ID' });
  }
});

module.exports = router;
