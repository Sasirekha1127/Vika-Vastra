const express = require('express');
const router = express.Router();
const multer = require('multer');
const SubCategory = require('../models/SubCategory');
const Category = require('../models/Category');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.get('/', async (req, res) => {
    try {
        console.log("Fetching subcategories...");
        const data = await SubCategory.findAll({ include: Category });
        console.log("Data found:", data.length); // Console la 0 varutha illa data varutha?
        res.json(data);
    } catch (err) { 
        console.error("Fetch Error:", err);
        res.status(500).json({ error: err.message }); 
    }
});
// POST add
router.post('/add', upload.single('image'), async (req, res) => {
    try {
        const { name, categoryId, status } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : null;
        const sub = await SubCategory.create({ name, categoryId, image, status });
        res.status(201).json(sub);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT update
router.put('/update/:id', upload.single('image'), async (req, res) => {
    try {
        const sub = await SubCategory.findByPk(req.params.id);
        if (!sub) return res.status(404).json({ message: 'Not found' });
        const { name, categoryId, status } = req.body;
        const image = req.file ? `uploads/${req.file.filename}` : sub.image;
        await sub.update({ name, categoryId, image, status });
        res.json(sub);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE
router.delete('/:id', async (req, res) => {
    try {
        await SubCategory.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;