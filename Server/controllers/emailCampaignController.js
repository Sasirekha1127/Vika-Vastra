const User = require('../models/User');
const UserLogin = require('../models/UserLogin');
const { sendOfferEmail } = require('../services/emailService');

exports.sendToSelectedCustomers = async (req, res) => {
  try {
    const { customerIds, campaignType, title, emailSubject, emailContent, discountLabel, code, expiresAt, shopUrl } = req.body;
    if (!Array.isArray(customerIds) || customerIds.length === 0) {
      return res.status(400).json({ success: false, error: 'Select at least one customer.' });
    }
    if (customerIds.length > 10000) {
      return res.status(400).json({ success: false, error: 'Send campaigns to no more than 10,000 customers at a time.' });
    }
    if (!['category', 'coupon', 'offer'].includes(campaignType)) {
      return res.status(400).json({ success: false, error: 'Choose a valid campaign template.' });
    }
    if (!String(title || '').trim() || !String(emailContent || '').trim()) {
      return res.status(400).json({ success: false, error: 'Email title and message are required.' });
    }
    if (campaignType === 'coupon' && !String(code || '').trim()) {
      return res.status(400).json({ success: false, error: 'Coupon code is required for a coupon email.' });
    }

    const ids = [...new Set(customerIds.map(Number).filter(Number.isInteger))];
    const recipients = await UserLogin.findAll({ where: { id: ids }, attributes: ['email'] });
    if (!recipients.some(recipient => String(recipient.email || '').trim())) {
      return res.status(400).json({ success: false, error: 'The selected customer record has no email address.' });
    }
    const result = await sendOfferEmail({
      title: String(title).trim(),
      emailSubject: String(emailSubject || title).trim(),
      emailContent: String(emailContent).trim(),
      discountLabel: String(discountLabel || '').trim(),
      code: campaignType === 'coupon' ? String(code || '').trim() : '',
      expires_at: expiresAt || null,
      shopUrl: shopUrl || process.env.STORE_URL,
    }, recipients.map(recipient => recipient.email), { batchSize: 100 });

    if ((result.failed || result.deferred) && !result.sent) {
      return res.status(502).json({ success: false, error: 'Email delivery failed.', details: result.errors, ...result, selected: ids.length });
    }
    res.json({ success: true, ...result, selected: ids.length });
  } catch (error) {
    console.error('Selected-customer campaign failed:', error);
    res.status(500).json({ success: false, error: 'Could not send campaign emails.' });
  }
};

exports.adminAuth = async (req, res, next) => {
  try {
    const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ success: false, error: 'Admin authentication required.' });
    const jwt = require('jsonwebtoken');
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!await User.findByPk(payload.id)) return res.status(401).json({ success: false, error: 'Invalid admin session.' });
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, code: 'ADMIN_SESSION_EXPIRED', error: 'Admin session expired. Please log in again.' });
    }
    res.status(401).json({ success: false, error: 'Invalid admin session. Please log in again.' });
  }
};
