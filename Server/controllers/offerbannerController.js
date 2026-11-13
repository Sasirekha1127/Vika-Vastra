const OfferBanner = require('../models/Offerbanner');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const UserLogin = require('../models/UserLogin');
const Customer = require('../models/Customer');
const { sendOfferEmail } = require('../services/emailService');
const nullIfEmpty = (val) => (val === '' || val === undefined || val === 'undefined' ? null : val);

const emailCustomers = async (offer) => {
  try {
    const [users, customers] = await Promise.all([
      UserLogin.findAll({ attributes: ['email'] }),
      Customer.findAll({ attributes: ['email'] }),
    ]);
    await sendOfferEmail(offer, [...users, ...customers].map(person => person.email));
  } catch (error) {
    console.error('Could not send offer emails:', error.message);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/offer-banners';
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

// ── GET all ─────────────────────────────────────────────────────
const getAllOfferBanners = async (req, res) => {
  try {
    const offers = await OfferBanner.findAll({ order: [['createdAt', 'DESC']] });
    res.json(offers);
  } catch (err) {
    console.error('getAllOfferBanners:', err);
    res.status(500).json({ error: err.message });
  }
};

// ── GET single ──────────────────────────────────────────────────
const getOfferBannerById = async (req, res) => {
  try {
    const offer = await OfferBanner.findByPk(req.params.id);
    if (!offer) return res.status(404).json({ error: 'Offer banner not found' });
    res.json(offer);
  } catch (err) {
    console.error('getOfferBannerById:', err);
    res.status(500).json({ error: err.message });
  }
};

// ── POST add ────────────────────────────────────────────────────
const addOfferBanner = async (req, res) => {
  try {
    console.log('📦 Body:', req.body);
    console.log('🖼️  File:', req.file);

    const {
      title, subtitle, content, discountLabel,
      brandTag, shopUrl, link, startDate, endDate, status,
      titleColor, discountColor,
    } = req.body;

    if (!title) return res.status(400).json({ error: 'Title is required' });

    const image = req.file ? req.file.path.replace(/\\/g, '/') : null;

    const offer = await OfferBanner.create({
      title,
      subtitle:      nullIfEmpty(subtitle),
      content:       nullIfEmpty(content),
      discountLabel: nullIfEmpty(discountLabel),
      brandTag:      nullIfEmpty(brandTag),
      shopUrl:       nullIfEmpty(shopUrl),
      link:          nullIfEmpty(link),
      startDate:     nullIfEmpty(startDate),
      endDate:       nullIfEmpty(endDate),
      status:        nullIfEmpty(status) || 'Active',
      titleColor:    nullIfEmpty(titleColor)    || '#ffffff',
      discountColor: nullIfEmpty(discountColor) || '#f5d78e',
      image,
    });

    if (offer.status === 'Active') await emailCustomers(offer);

    res.status(201).json({ message: 'Offer banner added successfully', offer });
  } catch (err) {
    console.error('❌ addOfferBanner ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ── PUT update ──────────────────────────────────────────────────
const updateOfferBanner = async (req, res) => {
  try {
    console.log('📦 Body:', req.body);
    console.log('🖼️  File:', req.file);

    const offer = await OfferBanner.findByPk(req.params.id);
    if (!offer) return res.status(404).json({ error: 'Offer banner not found' });

    const {
      title, subtitle, content, discountLabel,
      brandTag, shopUrl, link, startDate, endDate, status,
      titleColor, discountColor,
    } = req.body;

    if (req.file) {
      if (offer.image && fs.existsSync(offer.image)) fs.unlinkSync(offer.image);
      offer.image = req.file.path.replace(/\\/g, '/');
    }

    if (title         !== undefined)  offer.title         = title;
    if (subtitle      !== undefined)  offer.subtitle      = nullIfEmpty(subtitle);
    if (content       !== undefined)  offer.content       = nullIfEmpty(content);
    if (discountLabel !== undefined)  offer.discountLabel = nullIfEmpty(discountLabel);
    if (brandTag      !== undefined)  offer.brandTag      = nullIfEmpty(brandTag);
    if (shopUrl       !== undefined)  offer.shopUrl       = nullIfEmpty(shopUrl);
    if (link          !== undefined)  offer.link          = nullIfEmpty(link);
    if (startDate     !== undefined)  offer.startDate     = nullIfEmpty(startDate);
    if (endDate       !== undefined)  offer.endDate       = nullIfEmpty(endDate);
    if (status        !== undefined)  offer.status        = status;
    if (titleColor    !== undefined && titleColor    !== null && titleColor    !== '')  offer.titleColor    = titleColor;
    if (discountColor !== undefined && discountColor !== null && discountColor !== '')  offer.discountColor = discountColor;

    await offer.save();
    if (offer.status === 'Active') await emailCustomers(offer);
    res.json({ message: 'Offer banner updated successfully', offer });
  } catch (err) {
    console.error('❌ updateOfferBanner ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ── DELETE ──────────────────────────────────────────────────────
const deleteOfferBanner = async (req, res) => {
  try {
    const offer = await OfferBanner.findByPk(req.params.id);
    if (!offer) return res.status(404).json({ error: 'Offer banner not found' });

    if (offer.image && fs.existsSync(offer.image)) {
      fs.unlinkSync(offer.image);
    }

    await offer.destroy();
    res.json({ message: 'Offer banner deleted successfully' });
  } catch (err) {
    console.error('❌ deleteOfferBanner ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  upload,
  getAllOfferBanners,
  getOfferBannerById,
  addOfferBanner,
  updateOfferBanner,
  deleteOfferBanner,
};
