// backend/routes/userloginroutes.js
const express   = require('express');
const router    = express.Router();
const UserLogin = require('../models/UserLogin');
const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const { Op }    = require('sequelize');
const { sendOtpEmail } = require('../utils/emailService');
const { setOtp, getOtp, clearOtp } = require('../utils/otpStore');

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// POST /api/user/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;
    if (!username?.trim() || !email?.trim() || !password || !phone?.trim()) {
      return res.status(400).json({ error: 'Name, email, password, and phone number are required.' });
    }
    const existing = await UserLogin.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already registered.' });

    const hashed = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const pendingRegistration = { username: username.trim(), email: email.trim(), password: hashed, phone: phone.trim() };
    setOtp(`register:${email.trim()}`, JSON.stringify({ otp, ...pendingRegistration }));
    await sendOtpEmail(email.trim(), otp, 'Account Registration');
    res.status(200).json({ message: 'Verification code sent to your email.', requiresOtp: true, email: email.trim() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/user/verify-registration-otp
router.post('/verify-registration-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and verification code are required.' });
    const key = `register:${email.trim()}`;
    const storedOtp = getOtp(key);
    if (!storedOtp) return res.status(400).json({ message: 'Verification code expired. Please create your account again.' });
    let registration;
    try { registration = JSON.parse(storedOtp.otp); } catch { return res.status(400).json({ message: 'Invalid verification request. Please create your account again.' }); }
    if (registration.otp !== String(otp).trim()) return res.status(400).json({ message: 'Invalid verification code.' });
    const existing = await UserLogin.findOne({ where: { email: registration.email } });
    if (existing) return res.status(400).json({ message: 'Email already registered.' });
    const user = await UserLogin.create({
      username: registration.username,
      email: registration.email,
      password: registration.password,
      phone: registration.phone
    });
    clearOtp(key);
    res.status(201).json({
      message: 'Account verified and created successfully.',
      user: { id: user.id, username: user.username, email: user.email, phone: user.phone }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/user/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
    const user = await UserLogin.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid password.' });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, email: user.email, phone: user.phone }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/user  — admin customers list + dashboard count
router.get('/', async (req, res) => {
  try {
    const users = await UserLogin.findAll({
      attributes: ['id', 'username', 'email', 'phone', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/user/update-profile  — FIX: called by MyAccount edit profile modal
router.put('/update-profile', async (req, res) => {
  try {
    const { id, username, email, phone } = req.body;
    if (!id) return res.status(400).json({ error: 'User ID is required' });

    const numericId = parseInt(id, 10);

    // Check for duplicate username / email on OTHER accounts
    if (username || email) {
      const conditions = [];
      if (username) conditions.push({ username });
      if (email)    conditions.push({ email });

      const conflict = await UserLogin.findOne({
        where: {
          [Op.and]: [
            { id: { [Op.ne]: numericId } },
            { [Op.or]: conditions }
          ]
        }
      });

      if (conflict) {
        return res.status(400).json({ error: 'Username or Email already taken!' });
      }
    }

    const updateData = {};
    if (username)            updateData.username = username;
    if (email)               updateData.email    = email;
    if (phone !== undefined) updateData.phone    = phone || null;

    await UserLogin.update(updateData, { where: { id: numericId } });

    const updatedUser = await UserLogin.findOne({
      where: { id: numericId },
      attributes: ['id', 'username', 'email', 'phone']
    });

    if (!updatedUser) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({
      message: 'Profile updated successfully!',
      user: {
        id:       updatedUser.id,
        username: updatedUser.username,
        email:    updatedUser.email,
        phone:    updatedUser.phone
      }
    });
  } catch (err) {
    console.error('Update profile error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
