const express = require('express');
const router  = express.Router();
const DeliveryZone = require('../models/DeliveryZone');

// routes/deliveryZones.js — /active route
router.get('/active', async (req, res) => {
  try {
    const zones = await DeliveryZone.findAll({
      where: { is_active: true },
      order: [['state', 'ASC']],
      attributes: ['id', 'state', 'district', 'charge'],  // ← include district too
    });
    res.json(zones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUBLIC: GET charge for a specific district
router.get('/charge/:district', async (req, res) => {
    try {
        const zone = await DeliveryZone.findOne({
            where: { district: req.params.district, is_active: true },
        });
        if (!zone) return res.json({ charge: 0 }); // no zone = free delivery
        res.json({ charge: parseFloat(zone.charge) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ─────────────────────────────────────────────
//  ADMIN: GET all zones (active + inactive)
// ─────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const zones = await DeliveryZone.findAll({ order: [['district', 'ASC']] });
        res.json(zones);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// ADMIN: CREATE a new zone
router.post('/', async (req, res) => {
    try {
        const { state, district, charge, is_active } = req.body;
        if (!state || !district || charge === undefined) {
            return res.status(400).json({ success: false, message: 'state, district and charge are required.' });
        }
  // In POST / — replace the existing duplicate check line:
const existing = await DeliveryZone.findOne({ where: { state } });
if (existing) {
  return res.status(409).json({ success: false, message: `State "${state}" already has a delivery zone.` });
}
        const zone = await DeliveryZone.create({
            state: state.trim(),
            district: district.trim(),
            charge: parseFloat(charge),
            is_active: is_active !== undefined ? is_active : true,
        });
        res.status(201).json({ success: true, zone });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ADMIN: UPDATE a zone
router.put('/:id', async (req, res) => {
    try {
        const { district, charge, is_active } = req.body;
        const zone = await DeliveryZone.findByPk(req.params.id);
        if (!zone) return res.status(404).json({ success: false, message: 'Zone not found.' });

        // Check duplicate district name (exclude self)
        if (district && district !== zone.district) {
            const dup = await DeliveryZone.findOne({ where: { district } });
            if (dup) return res.status(409).json({ success: false, message: `District "${district}" already exists.` });
        }

        await zone.update({
            district:  district  !== undefined ? district.trim()      : zone.district,
            charge:    charge    !== undefined ? parseFloat(charge)    : zone.charge,
            is_active: is_active !== undefined ? is_active             : zone.is_active,
        });
        res.json({ success: true, zone });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ADMIN: DELETE a zone
router.delete('/:id', async (req, res) => {
    try {
        const zone = await DeliveryZone.findByPk(req.params.id);
        if (!zone) return res.status(404).json({ success: false, message: 'Zone not found.' });
        await zone.destroy();
        res.json({ success: true, message: 'Deleted successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ADMIN: TOGGLE active/inactive
router.patch('/:id/toggle', async (req, res) => {
    try {
        const zone = await DeliveryZone.findByPk(req.params.id);
        if (!zone) return res.status(404).json({ success: false, message: 'Zone not found.' });
        await zone.update({ is_active: !zone.is_active });
        res.json({ success: true, zone });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;