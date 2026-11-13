const UserLogin = require('../models/UserLogin');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

exports.register = async (req, res) => {
    try {
        const { username, email, password, phone } = req.body;

        // Email already exists check
        const emailExists = await UserLogin.findOne({ where: { email } });

        if (emailExists) {
            return res.status(401).json({ error: "This email is already registered!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await UserLogin.create({
            username, email, password: hashedPassword, phone: phone || null
        });

        res.status(201).json({
            message: "User created successfully!",
            user: { id: user.id, username: user.username, email: user.email, phone: user.phone }
        });
    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            const field = err.errors?.[0]?.path;
            if (field === 'username') {
                return res.status(400).json({ error: "This username is already taken. Please choose another!" });
            }
            if (field === 'email') {
                return res.status(400).json({ error: "This email is already registered!" });
            }
            return res.status(400).json({ error: "Duplicate entry. Please try different details." });
        }
        res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await UserLogin.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ message: "No account found with this email. Please register first." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            res.status(200).json({
                message: "Login successful",
                user: {
                    id:       user.id,
                    username: user.username,
                    email:    user.email,
                    phone:    user.phone || null
                }
            });
        } else {
            res.status(401).json({ message: "Incorrect password. Please try again." });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.updateProfile = async (req, res) => {
    try {
        const { id, username, email, phone } = req.body;
        if (!id) return res.status(400).json({ error: "User ID is required" });

        const numericId = parseInt(id, 10);
        
        // ← ADD THIS LINE to confirm new code is running
        console.log('updateProfile called with numericId:', numericId, typeof numericId);

        if (username || email) {
            const conditions = [];
            if (username) conditions.push({ username });
            if (email)    conditions.push({ email });

            const existing = await UserLogin.findOne({
                where: {
                    [Op.and]: [
                        { id: { [Op.ne]: numericId } },
                        { [Op.or]: conditions }
                    ]
                }
            });

            // ← ADD THIS to see what findOne returns
            console.log('Conflict check result:', existing ? `found id=${existing.id}` : 'none');

            if (existing) {
                return res.status(400).json({ error: "Username or Email already taken!" });
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

        if (!updatedUser) return res.status(404).json({ error: "User not found" });

        res.status(200).json({ message: "Profile updated successfully!", user: updatedUser });
    } catch (err) {
        console.error("Update profile error:", err.message);
        res.status(500).json({ error: err.message });
    }
};