const express = require('express');
const router = express.Router();
const {
  upload,
  getAllMiddleBanners,
  getMiddleBannerById,
  addMiddleBanner,
  updateMiddleBanner,
  deleteMiddleBanner,
} = require('../controllers/middleBannerController');

const multerMiddleware = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
};

router.get('/',           getAllMiddleBanners);
router.get('/:id',        getMiddleBannerById);
router.post('/add',       multerMiddleware, addMiddleBanner);
router.put('/update/:id', multerMiddleware, updateMiddleBanner);
router.delete('/:id',     deleteMiddleBanner);

module.exports = router;
