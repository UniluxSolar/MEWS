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

    // Trim and case-insensitive search
    const loginInput = username ? username.trim() : '';

    const user = await User.findOne({
        $or: [
            { username: { $regex: new RegExp(`^${loginInput}$`, "i") } },
            { email: loginInput.toLowerCase() }
        ]
    });

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
        // Enforce role verification
        if (role && user.role !== role) {
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
    } else {
        res.status(401);
        throw new Error('Invalid credentials');
    }
});

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

module.exports = { loginUser };
