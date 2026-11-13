const express = require('express');
const router = express.Router();
const { sendToSelectedCustomers, adminAuth } = require('../controllers/emailCampaignController');

router.post('/send', adminAuth, sendToSelectedCustomers);

module.exports = router;
