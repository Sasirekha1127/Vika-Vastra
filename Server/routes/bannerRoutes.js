const express = require('express');
const router = express.Router();
const {
  upload,
  getAllBanners,
  getBannerById,
  addBanner,
  updateBanner,
  deleteBanner,
} = require('../controllers/bannerController');

// GET    /banners            → all banners (sorted by sortOrder ASC)
// GET    /banners/:id        → single banner
// POST   /banners/add        → create banner  (multipart/form-data)
// PUT    /banners/update/:id → update banner  (multipart/form-data)
// DELETE /banners/:id        → delete banner

router.get('/',              getAllBanners);
router.get('/:id',           getBannerById);
router.post('/add',          upload.single('image'), addBanner);
router.put('/update/:id',    upload.single('image'), updateBanner);
router.delete('/:id',        deleteBanner);

module.exports = router;