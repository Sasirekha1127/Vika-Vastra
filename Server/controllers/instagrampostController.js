const InstagramPost = require('../models/InstagramPost');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ── Null helper (matches your offerBannerController pattern) ────
const nullIfEmpty = (val) =>
  val === '' || val === undefined || val === 'undefined' ? null : val;

// ── Multer Storage ──────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/instagram';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error(`Only image files are allowed. Got: ${file.mimetype}`));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ── GET all posts (public — Active only, sorted) ────────────────
const getAllPosts = async (req, res) => {
  try {
    const posts = await InstagramPost.findAll({
      where: { status: 'Active' },
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
    });
    res.json(posts);
  } catch (err) {
    console.error('getAllPosts:', err);
    res.status(500).json({ error: err.message });
  }
};

// ── GET all posts (admin — all statuses) ────────────────────────
const getAllPostsAdmin = async (req, res) => {
  try {
    const posts = await InstagramPost.findAll({
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
    });
    res.json(posts);
  } catch (err) {
    console.error('getAllPostsAdmin:', err);
    res.status(500).json({ error: err.message });
  }
};

// ── GET single post ─────────────────────────────────────────────
const getPostById = async (req, res) => {
  try {
    const post = await InstagramPost.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    console.error('getPostById:', err);
    res.status(500).json({ error: err.message });
  }
};

// ── POST add post ───────────────────────────────────────────────
const addPost = async (req, res) => {
  try {
    console.log('📦 Body:', req.body);
    console.log('🖼️  File:', req.file);

    const { label, tag,  postUrl, status, sortOrder } = req.body;
    if (!label) return res.status(400).json({ error: 'Label is required' });

    const image = req.file ? req.file.path.replace(/\\/g, '/') : null;

    const post = await InstagramPost.create({
      label,
      tag:       nullIfEmpty(tag),
  
      postUrl:   nullIfEmpty(postUrl),
      status:    nullIfEmpty(status) || 'Active',
      sortOrder: sortOrder ? parseInt(sortOrder) : 1,
      image,
    });

    res.status(201).json({ message: 'Post added successfully', post });
  } catch (err) {
    console.error('❌ addPost ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ── PUT update post ─────────────────────────────────────────────
const updatePost = async (req, res) => {
  try {
    console.log('📦 Body:', req.body);
    console.log('🖼️  File:', req.file);

    const post = await InstagramPost.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const { label, tag, postUrl, status, sortOrder } = req.body;

    if (req.file) {
      if (post.image && fs.existsSync(post.image)) fs.unlinkSync(post.image);
      post.image = req.file.path.replace(/\\/g, '/');
    }

    if (label     !== undefined) post.label     = label;
    if (tag       !== undefined) post.tag       = nullIfEmpty(tag);
   
    if (postUrl   !== undefined) post.postUrl   = nullIfEmpty(postUrl);
    if (status    !== undefined) post.status    = status;
    if (sortOrder !== undefined) post.sortOrder = parseInt(sortOrder);

    await post.save();
    res.json({ message: 'Post updated successfully', post });
  } catch (err) {
    console.error('❌ updatePost ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ── DELETE post ─────────────────────────────────────────────────
const deletePost = async (req, res) => {
  try {
    const post = await InstagramPost.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (post.image && fs.existsSync(post.image)) fs.unlinkSync(post.image);
    await post.destroy();
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('❌ deletePost ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  upload,
  getAllPosts,
  getAllPostsAdmin,
  getPostById,
  addPost,
  updatePost,
  deletePost,
};