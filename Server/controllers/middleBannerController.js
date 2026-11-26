const MiddleBanner = require('../models/MiddleBanner');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/middle-banners';
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
  limits: { fileSize: 10 * 1024 * 1024 },
});

// ── GET all ─────────────────────────────────────────────────────
const getAllMiddleBanners = async (req, res) => {
  try {
    const where = {};
    if (req.query.position) {
      where.position = req.query.position;
    }
    if (req.query.status) {
      where.status = req.query.status;
    }
    const banners = await MiddleBanner.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json(banners);
  } catch (err) {
    console.error('getAllMiddleBanners:', err);
    res.status(500).json({ error: err.message });
  }
};

// ── GET single ──────────────────────────────────────────────────
const getMiddleBannerById = async (req, res) => {
  try {
    const banner = await MiddleBanner.findByPk(req.params.id);
    if (!banner) return res.status(404).json({ error: 'Middle banner not found' });
    res.json(banner);
  } catch (err) {
    console.error('getMiddleBannerById:', err);
    res.status(500).json({ error: err.message });
  }
};

// ── POST add ────────────────────────────────────────────────────
const addMiddleBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Banner image is required' });
    }

    const image = req.file.path.replace(/\\/g, '/');
    const { link, status, position } = req.body;

    const banner = await MiddleBanner.create({
      title: 'Middle Banner',
      image,
      link: link || '/shop',
      shopUrl: link || '/shop',
      status: status || 'Active',
      position: position || 'new_arrivals',
    });

    res.status(201).json({
      message: 'Middle banner added successfully',
      banner,
    });
  } catch (err) {
    console.error('addMiddleBanner error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ── PUT update ──────────────────────────────────────────────────
const updateMiddleBanner = async (req, res) => {
  try {
    const banner = await MiddleBanner.findByPk(req.params.id);
    if (!banner) return res.status(404).json({ error: 'Middle banner not found' });

    let image = banner.image;
    if (req.file) {
      // Clean up old image if stored locally
      if (banner.image && fs.existsSync(banner.image)) {
        try { fs.unlinkSync(banner.image); } catch (_) {}
      }
      image = req.file.path.replace(/\\/g, '/');
    }

    const { link, status, position } = req.body;
    await banner.update({
      image,
      link: link !== undefined ? link : banner.link,
      shopUrl: link !== undefined ? link : banner.shopUrl,
      status: status !== undefined ? status : banner.status,
      position: position !== undefined ? position : banner.position,
    });

    res.json({ message: 'Middle banner updated successfully', banner });
  } catch (err) {
    console.error('updateMiddleBanner error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ── DELETE ──────────────────────────────────────────────────────
const deleteMiddleBanner = async (req, res) => {
  try {
    const banner = await MiddleBanner.findByPk(req.params.id);
    if (!banner) return res.status(404).json({ error: 'Middle banner not found' });

    if (banner.image && fs.existsSync(banner.image)) {
      try { fs.unlinkSync(banner.image); } catch (_) {}
    }

    await banner.destroy();
    res.json({ message: 'Middle banner deleted successfully' });
  } catch (err) {
    console.error('deleteMiddleBanner error:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  upload,
  getAllMiddleBanners,
  getMiddleBannerById,
  addMiddleBanner,
  updateMiddleBanner,
  deleteMiddleBanner,
};
