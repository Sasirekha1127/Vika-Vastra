const Banner = require('../models/Banner');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ── Multer Storage ──────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/banners';
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
  const allowedExt = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
    ".jfif"
  ];

  const allowedMime = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif"
  ];

  const ext = path
    .extname(file.originalname)
    .toLowerCase();

  if (
    allowedExt.includes(ext) &&
    allowedMime.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG JPEG PNG WEBP GIF images are allowed"
      )
    );
  }
},
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// ── GET all banners ─────────────────────────────────────────────
const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.findAll({ order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']] });
    res.json(banners);
  } catch (err) {
    console.error('getAllBanners:', err);
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
};

// ── GET single banner ───────────────────────────────────────────
const getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) return res.status(404).json({ error: 'Banner not found' });
    res.json(banner);
  } catch (err) {
    console.error('getBannerById:', err);
    res.status(500).json({ error: 'Failed to fetch banner' });
  }
};

// ── POST add banner ─────────────────────────────────────────────
const addBanner = async (req, res) => {
  try {
    const { title, subtitle, content, link, sortOrder, status } = req.body; // ← subtitle, content
   

    const image = req.file ? req.file.path.replace(/\\/g, '/') : null;

    const banner = await Banner.create({
      title,
      subtitle: subtitle || null,      // ← NEW
      content:  content  || null,      // ← NEW
      link: link || null,
      sortOrder: sortOrder ? parseInt(sortOrder) : 1,
      status: status || 'Active',
      image,
    });

    res.status(201).json({ message: 'Banner added successfully', banner });
  } catch (err) {
    console.error('addBanner:', err);
    res.status(500).json({ error: 'Failed to add banner' });
  }
};

// ── PUT update banner ───────────────────────────────────────────
const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) return res.status(404).json({ error: 'Banner not found' });

    const { title, subtitle, content, link, sortOrder, status } = req.body; // ← subtitle, content

    if (req.file) {
      if (banner.image && fs.existsSync(banner.image)) fs.unlinkSync(banner.image);
      banner.image = req.file.path.replace(/\\/g, '/');
    }

    banner.title     = title     || banner.title;
    banner.subtitle  = subtitle  !== undefined ? subtitle  : banner.subtitle; // ← NEW
    banner.content   = content   !== undefined ? content   : banner.content;  // ← NEW
    banner.link      = link      !== undefined ? link      : banner.link;
    banner.sortOrder = sortOrder ? parseInt(sortOrder) : banner.sortOrder;
    banner.status    = status    || banner.status;

    await banner.save();
    res.json({ message: 'Banner updated successfully', banner });
  } catch (err) {
    console.error('updateBanner:', err);
    res.status(500).json({ error: 'Failed to update banner' });
  }
};

// ── DELETE banner ───────────────────────────────────────────────
const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) return res.status(404).json({ error: 'Banner not found' });

    if (banner.image && fs.existsSync(banner.image)) {
      fs.unlinkSync(banner.image);
    }

    await banner.destroy();
    res.json({ message: 'Banner deleted successfully' });
  } catch (err) {
    console.error('deleteBanner:', err);
    res.status(500).json({ error: 'Failed to delete banner' });
  }
};

module.exports = {
  upload,
  getAllBanners,
  getBannerById,
  addBanner,
  updateBanner,
  deleteBanner,
};