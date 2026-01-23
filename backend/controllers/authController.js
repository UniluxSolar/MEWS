const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Member = require('../models/Member');
const { sendSms } = require('../utils/smsService');

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
    }).populate('memberId', 'name surname');

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

            // Send Token in HttpOnly Cookie
            res.cookie('jwt', generateToken(user._id, user._id), {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax', // Relaxed for better compatibility with redirections/initial loads
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            });

            res.json({
                _id: user.id,
                name: user.memberId ? `${user.memberId.name} ${user.memberId.surname}` : user.username,
                username: user.username,
                email: user.email,
                role: user.role,
                assignedLocation: user.assignedLocation,
                locationName,
                institutionId: user.institutionId,
            });
            return;
        }
    }

    console.log("--- DEBUG FAILURE: Invalid Credentials ---");
    res.status(401);
    throw new Error('Invalid Credentials');
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Logged out successfully' });
});

// @desc    Get current user profile (for auth check)
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    let user = {
        _id: req.user._id,
        name: req.user.username || req.user.name, // Handle User vs Member
        email: req.user.email,
        role: req.user.role,
        assignedLocation: req.user.assignedLocation,
        institutionId: req.user.institutionId,
        // photoUrl for frontend
        photoUrl: req.user.photoUrl,
        headPhotoUrl: req.user.photoUrl,
        memberType: 'HEAD'
    };

    // If logged in as a dependent, override details
    if (req.loggedInMemberId && req.loggedInMemberId !== req.user._id.toString()) {
        if (req.user.familyMembers) {
            const dependent = req.user.familyMembers.find(fm =>
                (fm._id && fm._id.toString() === req.loggedInMemberId) ||
                (fm.mewsId && fm.mewsId === req.loggedInMemberId)
            );

            if (dependent) {
                user = {
                    ...user,
                    memberId: dependent._id || dependent.mewsId,
                    name: dependent.name,
                    surname: dependent.surname || user.surname,
                    mobileNumber: dependent.mobileNumber,
                    photoUrl: dependent.photo,
                    memberType: 'DEPENDENT',
                    relation: dependent.relation
                };
            }
        }
    }

    res.status(200).json(user);
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


const generateToken = (id, memberId) => {
    return jwt.sign({ id, memberId }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

// @desc    Request OTP for Member/Institution Login
// @route   POST /api/auth/request-otp
// @access  Public
const requestOtp = asyncHandler(async (req, res) => {
    const { mobile, userType } = req.body;

    if (!mobile) {
        res.status(400);
        throw new Error('Mobile number is required');
    }

    let user = null;
    let foundUserType = '';

    // STRICT CHECKING BASED ON userType
    if (userType === 'MEMBER') {
        user = await Member.findOne({
            $or: [
                { mobileNumber: mobile },
                { "familyMembers.mobileNumber": mobile }
            ]
        });
        foundUserType = 'MEMBER';
    } else if (userType === 'INSTITUTION') {
        const Institution = require('../models/Institution');
        user = await Institution.findOne({ mobileNumber: mobile });
        foundUserType = 'INSTITUTION';
    } else {
        // Fallback: Check Member first, then Institution (Legacy behavior)
        user = await Member.findOne({
            $or: [
                { mobileNumber: mobile },
                { "familyMembers.mobileNumber": mobile }
            ]
        });
        foundUserType = 'MEMBER';

        if (!user) {
            const Institution = require('../models/Institution');
            user = await Institution.findOne({ mobileNumber: mobile });
            foundUserType = 'INSTITUTION';
        }
    }

    if (!user) {
        res.status(404);
        throw new Error(`No ${userType ? (userType === 'MEMBER' ? 'Member' : 'Institution') : 'User'} found with this mobile number`);
    }

    // 3. Rate Limiting Check
    if (user.otpLastSent) {
        const timeSinceLastSent = Date.now() - new Date(user.otpLastSent).getTime();
        const waitTime = 60 * 1000; // 60 seconds
        if (timeSinceLastSent < waitTime) {
            res.status(429); // Too Many Requests
            throw new Error(`Please wait ${Math.ceil((waitTime - timeSinceLastSent) / 1000)} seconds before requesting a new OTP.`);
        }
    }

    // 4. Generate 6-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // 5. Hash OTP
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);

    // 6. Update User with OTP Hash, Expiry (5 mins), and Last Sent
    user.otpHash = otpHash;
    user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    user.otpLastSent = Date.now();

    // Clear any previous plain text OTP if it exists (migration cleanup)
    if (user.otp) user.otp = undefined;

    await user.save();

    // 7. Send SMS via Twilio
    // Format Mobile Number for Twilio (Ensure +91 for India if missing)
    let formattedMobile = mobile.trim();
    if (!formattedMobile.startsWith('+')) {
        formattedMobile = `+91${formattedMobile}`;
    }

    const smsResult = await sendSms(formattedMobile, `Your MEWS ${userType === 'INSTITUTION' ? 'Institution' : 'Member'} Login OTP is: ${otp}. Valid for 5 minutes.`);

    console.log(`[OTP] Generated for ${mobile} (${userType}): ${otp} | SMS Result:`, smsResult);

    if (smsResult.success) {
        res.json({
            message: 'OTP sent successfully to your mobile number',
            mobile,
            userType // Optional: let frontend know what type was found
        });
    } else {
        // Fallback for Trial Accounts / Dev Mode
        console.warn('--- TWILIO FALLBACK ---');
        console.warn(`SMS failed. Use OTP ${otp} (View Console)`);
        console.warn('-----------------------');

        const errorMsg = smsResult.error || 'Unknown Twilio Error';
        res.json({
            message: `SMS Failed (${errorMsg}). Use OTP ${otp} (View Console)`,
            mobile,
            otp,
            userType,
            error: errorMsg
        });
    }
});

// @desc    Verify OTP and Login Member/Institution
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = asyncHandler(async (req, res) => {
    const { mobile, otp, userType } = req.body;

    if (!mobile || !otp) {
        res.status(400);
        throw new Error('Mobile and OTP are required');
    }

    let user = null;
    let foundUserType = '';

    // STRICT CHECKING BASED ON userType
    if (userType === 'MEMBER') {
        user = await Member.findOne({
            $or: [
                { mobileNumber: mobile },
                { "familyMembers.mobileNumber": mobile }
            ]
        });
        foundUserType = 'MEMBER';
    } else if (userType === 'INSTITUTION') {
        const Institution = require('../models/Institution');
        user = await Institution.findOne({ mobileNumber: mobile });
        foundUserType = 'INSTITUTION';
    } else {
        // Fallback
        user = await Member.findOne({
            $or: [
                { mobileNumber: mobile },
                { "familyMembers.mobileNumber": mobile }
            ]
        });
        foundUserType = 'MEMBER';

        if (!user) {
            const Institution = require('../models/Institution');
            user = await Institution.findOne({ mobileNumber: mobile });
            foundUserType = 'INSTITUTION';
        }
    }

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Check if OTP exists and is not expired
    if (!user.otpHash || !user.otpExpires) {
        res.status(400);
        throw new Error('No OTP requested or access expired. Please request a new OTP.');
    }

    if (user.otpExpires < Date.now()) {
        res.status(400);
        throw new Error('OTP has expired. Please request a new one.');
    }

    // Verify Hash
    const isMatch = await bcrypt.compare(otp, user.otpHash);

    if (!isMatch) {
        res.status(400);
        throw new Error('Invalid OTP');
    }

    // Verification Successful
    // user.isPhoneVerified = true; // Institution might not have this field or might need it added. 
    // Ideally we should double check schema but typically good to set if exists.
    if (userType === 'MEMBER' || user.isPhoneVerified !== undefined) {
        user.isPhoneVerified = true;
    }

    user.otpHash = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Identify who is logging in (Head or Dependent)
    let loggedInMember = {
        _id: user._id, // Default to Head
        name: user.name,
        surname: user.surname,
        mobileNumber: user.mobileNumber,
        photoUrl: user.photoUrl,
        memberType: 'HEAD'
    };

    if (userType === 'MEMBER') {
        if (user.mobileNumber === mobile) {
            // Head is logging in
            loggedInMember.memberType = 'HEAD';
        } else if (user.familyMembers && user.familyMembers.length > 0) {
            // Check dependents
            const dependent = user.familyMembers.find(fm => fm.mobileNumber === mobile);
            if (dependent) {
                loggedInMember = {
                    _id: user._id, // Main Document ID (for API calls)
                    memberId: dependent._id || dependent.mewsId, // Specific Member ID
                    name: dependent.name,
                    surname: dependent.surname || user.surname, // Fallback to family surname
                    mobileNumber: dependent.mobileNumber,
                    photoUrl: dependent.photo,
                    memberType: 'DEPENDENT',
                    relation: dependent.relation
                };
            }
        }
    }

    // Send Token in HttpOnly Cookie
    res.cookie('jwt', generateToken(user._id, loggedInMember.memberId || loggedInMember._id), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    // Determine Role (Use Member's role if elevated, otherwise 'MEMBER')
    let finalRole = userType;
    if (userType === 'MEMBER') {
        finalRole = (user.role && user.role !== 'MEMBER') ? user.role : 'MEMBER';
    }

    res.json({
        _id: user.id, // Keep main ID for token/API compatibility
        ...loggedInMember, // Spread specific details (overwrites name/mobile if dependent)
        role: finalRole, // Return actual role (e.g. VILLAGE_ADMIN)
        assignedLocation: user.assignedLocation, // Send assigned location ID
        institutionType: user.type, // Optional: if Institution, send type
        isFamilyLogin: loggedInMember.memberType === 'DEPENDENT',
        token: generateToken(user._id, loggedInMember.memberId || loggedInMember._id) // Fallback for Header-based Auth
    });
});

module.exports = { loginUser, changePassword, toggleTwoFactor, requestOtp, verifyOtp, logoutUser, getMe };
