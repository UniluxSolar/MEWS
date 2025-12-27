const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { username, password, role } = req.body; // Receive role from frontend
    console.log("--- DEBUG LOGIN ATTEMPT ---");
    console.log("Request Body:", { username, role, passwordProvided: !!password });

    // Trim and case-insensitive search
    const loginInput = username ? username.trim() : '';

    const user = await User.findOne({
        $or: [
            { username: { $regex: new RegExp(`^${loginInput}$`, "i") } },
            { email: loginInput.toLowerCase() }
        ]
    });

    console.log("User Found in DB:", user ? "YES" : "NO");
    if (user) {
        console.log("User Role in DB:", user.role);
        console.log("User stored password hash:", user.passwordHash ? "Present" : "Missing");
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        console.log("Password Match Result:", isMatch);

        if (isMatch) {
            // Enforce role verification
            if (role && user.role !== role) {
                console.log(`Role Mismatch! Expected ${user.role}, got ${role}`);
                res.status(401);
                throw new Error(`Unauthorized: You are not a ${role.replace('_', ' ')}`);
            }

            res.json({
                _id: user.id,
                name: user.username,
                email: user.email,
                role: user.role,
                assignedLocation: user.assignedLocation,
                institutionId: user.institutionId,
                token: generateToken(user._id)
            });
            return;
        }
    }

    console.log("--- DEBUG FAILURE: Invalid Credentials ---");
    res.status(401);
    throw new Error('Invalid Credentials');
});

// @desc    Change user password
// @route   PUT /api/auth/password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (user && (await bcrypt.compare(oldPassword, user.passwordHash))) {
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(newPassword, salt);
        await user.save();
        res.json({ message: 'Password updated successfully' });
    } else {
        res.status(401);
        throw new Error('Invalid old password');
    }
});

// @desc    Toggle Two-Factor Authentication
// @route   PUT /api/auth/2fa
// @access  Private
const toggleTwoFactor = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.twoFactorEnabled = !user.twoFactorEnabled;
    await user.save();

    res.json({
        message: `Two-Factor Authentication ${user.twoFactorEnabled ? 'Enabled' : 'Disabled'}`,
        enabled: user.twoFactorEnabled
    });
});


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

module.exports = { loginUser, changePassword, toggleTwoFactor };
