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

            // Fetch Location Name
            let locationName = '';
            if (user.assignedLocation) {
                const Location = require('../models/Location');
                const loc = await Location.findById(user.assignedLocation);
                if (loc) locationName = loc.name;
            }

            res.json({
                _id: user.id,
                name: user.username,
                email: user.email,
                role: user.role,
                assignedLocation: user.assignedLocation,
                locationName, // Include in response
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

// @desc    Request OTP for Member Login
// @route   POST /api/auth/request-otp
// @access  Public
const Member = require('../models/Member');
const { sendSms } = require('../utils/smsService');

const requestOtp = asyncHandler(async (req, res) => {
    const { mobile } = req.body;

    if (!mobile) {
        res.status(400);
        throw new Error('Mobile number is required');
    }

    // Find member by mobile
    const member = await Member.findOne({ mobileNumber: mobile });

    if (!member) {
        res.status(404);
        throw new Error('Member not found with this mobile number');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP and expiry (10 minutes)
    member.otp = otp;
    member.otpExpires = Date.now() + 10 * 60 * 1000;

    await member.save();

    // Format Mobile Number for Twilio (Ensure +91 for India if missing)
    let formattedMobile = mobile.trim();
    if (!formattedMobile.startsWith('+')) {
        formattedMobile = `+91${formattedMobile}`;
    }

    // Send SMS via Twilio
    const smsSent = await sendSms(formattedMobile, `Your MEWS Login OTP is: ${otp}. Valid for 10 minutes.`);

    console.log(`[OTP] Generated for ${mobile}: ${otp} | SMS Sent: ${smsSent}`);

    // Return OTP in response ONLY if SMS failed (or keep for dev? I'll keep for dev convenience)
    res.json({
        message: smsSent ? 'OTP sent to mobile' : 'Failed to send SMS (Check Consoles)',
        mobile,
        otp: otp // ALWAYS return OTP for testing as per user request
    });

    // Dev Override: Always return OTP for now to ensure user isn't locked out if credentials fail
    // res.json({ message: 'OTP processed', mobile, otp, smsStatus: smsSent ? 'Sent' : 'Failed' });
});

// @desc    Verify OTP and Login Member
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = asyncHandler(async (req, res) => {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
        res.status(400);
        throw new Error('Mobile and OTP are required');
    }

    const member = await Member.findOne({ mobileNumber: mobile });

    if (!member) {
        res.status(404);
        throw new Error('Member not found');
    }

    if (member.otp !== otp) {
        res.status(400);
        throw new Error('Invalid OTP');
    }

    if (member.otpExpires < Date.now()) {
        res.status(400);
        throw new Error('OTP has expired');
    }

    // Clear OTP
    member.otp = undefined;
    member.otpExpires = undefined;
    await member.save();

    res.json({
        _id: member.id,
        name: member.name,
        surname: member.surname,
        mobileNumber: member.mobileNumber,
        role: 'MEMBER', // Explicitly set role for frontend handling
        token: generateToken(member._id)
    });
});

module.exports = { loginUser, changePassword, toggleTwoFactor, requestOtp, verifyOtp };
