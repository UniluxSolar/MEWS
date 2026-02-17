const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Member = require('../models/Member');
const crypto = require('crypto'); // Built-in Node.js crypto for SHA256

// Helper to normalize mobile numbers for consistent lookup
const normalizeMobile = (mobile) => {
    if (!mobile) return '';
    let cleaned = mobile.toString().trim().replace(/\D/g, ''); // Remove all non-digits
    if (cleaned.length === 10) return cleaned; // Standard 10-digit
    if (cleaned.length === 12 && cleaned.startsWith('91')) return cleaned.substring(2); // Remove 91 prefix
    return cleaned;
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
// @desc    Auth user & get token (Unified Login for all roles)
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { username, password, portal } = req.body;

    if (!username || !password) {
        res.status(400);
        throw new Error('Username (Email/Mobile) and Password are required');
    }

    const loginInput = username.trim();
    const isEmail = loginInput.includes('@');
    let normalized = loginInput;
    if (!isEmail) {
        normalized = normalizeMobile(loginInput);
    }

    console.log(`[LOGIN] Attempt: ${normalized} | Portal: ${portal || 'LEGACY'}`);

    const query = isEmail ? { email: normalized.toLowerCase() } : {
        $or: [
            { mobileNumber: normalized },
            { mobileNumber: `+91${normalized}` },
            { username: normalized },
            { username: `+91${normalized}` }
        ]
    };

    let user = null;
    let userType = null;

    // STRICT CONTEXT SWITCHING
    if (portal === 'ADMIN') {
        user = await User.findOne(query).populate('memberId', 'name surname');
        if (user) userType = 'ADMIN';
    }
    else if (portal === 'MEMBER') {
        const buildMemberQuery = isEmail ? { email: normalized.toLowerCase() } : {
            $or: [
                { mobileNumber: normalized },
                { mobileNumber: `+91${normalized}` },
                { "familyMembers.mobileNumber": normalized },
                { "familyMembers.mobileNumber": `+91${normalized}` }
            ]
        };
        user = await Member.findOne(buildMemberQuery);
        if (user) userType = 'MEMBER';
    }
    else if (portal === 'INSTITUTION') {
        const Institution = require('../models/Institution');
        user = await Institution.findOne(query);
        if (user) userType = 'INSTITUTION';
    }
    else {
        // Fallback for legacy calls (or if portal missing) -> Sequential Search
        // 1. User
        user = await User.findOne(query).populate('memberId', 'name surname');
        if (user) userType = 'ADMIN';

        // 2. Member
        if (!user) {
            const buildMemberQuery = isEmail ? { email: normalized.toLowerCase() } : {
                $or: [
                    { mobileNumber: normalized },
                    { mobileNumber: `+91${normalized}` },
                    { "familyMembers.mobileNumber": normalized },
                    { "familyMembers.mobileNumber": `+91${normalized}` }
                ]
            };
            user = await Member.findOne(buildMemberQuery);
            if (user) userType = 'MEMBER';
        }

        // 3. Institution
        if (!user) {
            const Institution = require('../models/Institution');
            user = await Institution.findOne(query);
            if (user) userType = 'INSTITUTION';
        }
    }

    if (!user) {
        res.status(401);
        throw new Error('Invalid Credentials');
    }

    // Check Password
    if (!user.passwordHash) {
        res.status(401);
        throw new Error('Password not set. Please use "Forgot Password" to setup your password for the first time.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
        res.status(401);
        throw new Error('Invalid Credentials');
    }

    // Identify Logged In Record
    let loggedInUser = {
        _id: user._id,
        name: user.name || user.username || 'User',
        email: user.email,
        role: user.role || userType,
        token: generateToken(user._id, user._id)
    };

    // Specific logic for Member (Head/Dependent)
    if (userType === 'MEMBER') {
        const userMobileNormalized = normalizeMobile(user.mobileNumber || '');
        const loginNormalized = isEmail ? user.email.toLowerCase() : normalized;

        if (loginNormalized !== (isEmail ? user.email.toLowerCase() : userMobileNormalized)) {
            // Check if it's a dependent
            const dependent = user.familyMembers?.find(fm => {
                if (isEmail) return fm.email && fm.email.toLowerCase() === loginNormalized;
                return normalizeMobile(fm.mobileNumber || '') === loginNormalized;
            });

            if (dependent) {
                loggedInUser.memberId = dependent._id;
                loggedInUser.name = `${dependent.name} ${dependent.surname || user.surname}`;
                loggedInUser.memberType = 'DEPENDENT';
                // Regerate token for dependent
                loggedInUser.token = generateToken(user._id, dependent._id);
            }
        } else {
            loggedInUser.memberType = 'HEAD';
            loggedInUser.name = `${user.name} ${user.surname}`;
        }
    }

    // Fetch Location Name for Admins
    if (userType === 'ADMIN' && user.assignedLocation) {
        const Location = require('../models/Location');
        const loc = await Location.findById(user.assignedLocation);
        if (loc) loggedInUser.locationName = loc.name;
    }

    // Send Token in HttpOnly Cookie
    res.cookie('jwt', loggedInUser.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.json(loggedInUser);
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
        role: req.user.role || 'MEMBER', // Default to MEMBER if role is missing
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
// @desc    Request OTP for Member/Institution/Admin Login
// @route   POST /api/auth/request-otp
// @access  Public
const requestOtp = asyncHandler(async (req, res) => {
    const { loginInput, userType } = req.body;

    if (!loginInput) {
        res.status(400);
        throw new Error('Email or Mobile Number is required');
    }

    // Determine if input is Email or Mobile
    const isEmail = loginInput.includes('@');
    let normalized = loginInput;
    if (!isEmail) {
        normalized = normalizeMobile(loginInput);
    }

    let user;
    let foundUserType = '';

    // Search query construction
    const buildQuery = (emailOrMobile) => {
        if (isEmail) {
            return { email: emailOrMobile.toLowerCase() };
        } else {
            return {
                $or: [
                    { mobileNumber: emailOrMobile },
                    { mobileNumber: `+91${emailOrMobile}` },
                    { username: emailOrMobile },
                    { username: `+91${emailOrMobile}` },
                    { "familyMembers.mobileNumber": emailOrMobile },
                    { "familyMembers.mobileNumber": `+91${emailOrMobile}` }
                ]
            };
        }
    };

    // 1. Find the User
    if (userType === 'MEMBER') {
        user = await Member.findOne(buildQuery(normalized));
        foundUserType = 'MEMBER';
    } else if (userType === 'INSTITUTION') {
        const Institution = require('../models/Institution');
        user = await Institution.findOne(buildQuery(normalized));
        foundUserType = 'INSTITUTION';
    } else if (userType === 'ADMIN') {
        user = await User.findOne(buildQuery(normalized));
        foundUserType = 'ADMIN';
    } else {
        // Fallback: Check Member first, then Institution, then Admin
        user = await Member.findOne(buildQuery(normalized));
        foundUserType = 'MEMBER';

        if (!user) {
            const Institution = require('../models/Institution');
            user = await Institution.findOne(buildQuery(normalized));
            foundUserType = 'INSTITUTION';
        }

        if (!user) {
            user = await User.findOne(buildQuery(normalized));
            foundUserType = 'ADMIN';
        }
    }

    if (!user) {
        res.status(404);
        throw new Error(`Record not found for the provided ${isEmail ? 'email' : 'mobile number'}`);
    }

    // 2. Ensure Email Exists (CRITICAL: Required for OTP)
    if (!user.email) {
        res.status(400);
        throw new Error('No email address is registered for this account. Please contact support to register your email.');
    }

    // 3. Rate Limiting Check
    if (user.otpLastSent) {
        const timeSinceLastSent = Date.now() - new Date(user.otpLastSent).getTime();
        const waitTime = 60 * 1000; // 60 seconds
        if (timeSinceLastSent < waitTime) {
            res.status(429);
            throw new Error(`Please wait ${Math.ceil((waitTime - timeSinceLastSent) / 1000)} seconds before requesting a new code.`);
        }
    }

    // 4. Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // 5. Hash OTP
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);

    // 6. Update User
    user.otpHash = otpHash;
    user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    user.otpLastSent = Date.now();
    if (user.otp) user.otp = undefined;

    await user.save();

    // 7. Send Email OTP
    const { sendEmail } = require('../utils/emailService');
    try {
        await sendEmail(
            user.email,
            'MEWS Verification Code',
            `Your MEWS Verification Code is: ${otp}. Valid for 5 minutes.`,
            `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e1e8ed; border-radius: 12px;">
                <h2 style="color: #1e2a4a; text-align: center;">MEWS Verification</h2>
                <p>Hello,</p>
                <p>Your verification code for logging into the MEWS portal is:</p>
                <div style="background-color: #f0f4f8; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                    <h1 style="color: #1e2a4a; letter-spacing: 10px; font-size: 32px; margin: 0;">${otp}</h1>
                </div>
                <p style="color: #657786; font-size: 14px;">This code is valid for 5 minutes. Please do not share this with anyone.</p>
                <hr style="border: none; border-top: 1px solid #e1e8ed; margin: 20px 0;" />
                <p style="color: #657786; font-size: 12px; text-align: center;">Regards,<br/>MEWS Team</p>
            </div>`
        );
        console.log(`[OTP] Email sent to ${user.email}`);

        res.json({
            message: `Verification code sent to your registered email: ${user.email.replace(/(.{2})(.*)(?=@)/, (gp1, gp2, gp3) => gp2 + '*'.repeat(gp3.length))}`,
            loginInput: loginInput,
            userType: foundUserType,
            otp: process.env.NODE_ENV !== 'production' ? otp : undefined // Return OTP for dev
        });
    } catch (e) {
        console.error(`[OTP] Email failed to ${user.email}:`, e.message);
        res.status(500);
        throw new Error('Failed to send verification email. Please check your internet connection or try again later.');
    }
});

// @desc    Verify OTP and Login Member/Institution/Admin
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = asyncHandler(async (req, res) => {
    const { loginInput, otp, userType } = req.body;

    if (!loginInput || !otp) {
        res.status(400);
        throw new Error('Email/Mobile and OTP are required');
    }

    const isEmail = loginInput.includes('@');
    let normalized = loginInput;
    if (!isEmail) {
        normalized = normalizeMobile(loginInput);
    }

    // Reuse buildQuery logic
    const query = isEmail ? { email: normalized.toLowerCase() } : {
        $or: [
            { mobileNumber: normalized },
            { mobileNumber: `+91${normalized}` },
            { username: normalized },
            { username: `+91${normalized}` },
            { "familyMembers.mobileNumber": normalized },
            { "familyMembers.mobileNumber": `+91${normalized}` }
        ]
    };

    let user;
    let foundUserType = '';

    // STRICT CHECKING BASED ON userType
    if (userType === 'MEMBER') {
        user = await Member.findOne(query);
        foundUserType = 'MEMBER';
    } else if (userType === 'INSTITUTION') {
        const Institution = require('../models/Institution');
        user = await Institution.findOne(query);
        foundUserType = 'INSTITUTION';
    } else if (userType === 'ADMIN') {
        user = await User.findOne(query);
        foundUserType = 'ADMIN';
    } else {
        // Fallback
        user = await Member.findOne(query);
        foundUserType = 'MEMBER';

        if (!user) {
            const Institution = require('../models/Institution');
            user = await Institution.findOne(query);
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
        email: user.email,
        photoUrl: user.photoUrl,
        memberType: 'HEAD'
    };

    if (foundUserType === 'ADMIN') {
        loggedInMember = {
            _id: user._id,
            name: user.username,
            surname: '',
            mobileNumber: user.mobileNumber,
            email: user.email,
            photoUrl: '',
            memberType: 'ADMIN'
        };
    }

    if (userType === 'MEMBER') {
        const userMobileNormalized = normalizeMobile(user.mobileNumber || '');
        const loginNormalized = isEmail ? user.email.toLowerCase() : normalized;

        if (loginNormalized === (isEmail ? user.email.toLowerCase() : userMobileNormalized)) {
            // Head is logging in
            loggedInMember.memberType = 'HEAD';
        } else if (user.familyMembers && user.familyMembers.length > 0) {
            // Check dependents
            const dependent = user.familyMembers.find(fm => {
                if (isEmail) return fm.email && fm.email.toLowerCase() === loginNormalized;
                return normalizeMobile(fm.mobileNumber || '') === loginNormalized;
            });

            if (dependent) {
                loggedInMember = {
                    _id: user._id, // Main Document ID (for API calls)
                    memberId: dependent._id || dependent.mewsId, // Specific Member ID
                    name: dependent.name,
                    surname: dependent.surname || user.surname, // Fallback to family surname
                    mobileNumber: dependent.mobileNumber,
                    email: dependent.email,
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

    // Fetch Location Name for Admins/Users with assignedLocation
    let locationName = '';
    if (user.assignedLocation) {
        const Location = require('../models/Location');
        const loc = await Location.findById(user.assignedLocation);
        if (loc) locationName = loc.name;
    }

    res.json({
        _id: user.id, // Keep main ID for token/API compatibility
        ...loggedInMember, // Spread specific details (overwrites name/mobile if dependent)
        role: user.role || finalRole, // Return actual role (e.g. VILLAGE_ADMIN)
        assignedLocation: user.assignedLocation, // Send assigned location ID
        locationName, // Added locationName
        institutionType: user.type, // Optional: if Institution, send type
        isFamilyLogin: loggedInMember.memberType === 'DEPENDENT',
        token: generateToken(user._id, loggedInMember.memberId || loggedInMember._id) // Fallback for Header-based Auth
    });
});


// @desc    Forgot Password - Send OTP to Email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
    const { loginInput } = req.body;

    if (!loginInput) {
        res.status(400);
        throw new Error('Email or Mobile Number is required');
    }

    const isEmail = loginInput.includes('@');
    let normalized = loginInput;
    if (!isEmail) {
        normalized = normalizeMobile(loginInput);
    }

    const query = isEmail ? { email: normalized.toLowerCase() } : {
        $or: [
            { mobileNumber: normalized },
            { mobileNumber: `+91${normalized}` },
            { username: normalized },
            { username: `+91${normalized}` }
        ]
    };

    // 1. Try User
    let user = await User.findOne(query);

    // 2. Try Member
    if (!user) {
        const buildMemberQuery = isEmail ? { email: normalized.toLowerCase() } : {
            $or: [
                { mobileNumber: normalized },
                { mobileNumber: `+91${normalized}` },
                { "familyMembers.mobileNumber": normalized },
                { "familyMembers.mobileNumber": `+91${normalized}` }
            ]
        };
        user = await Member.findOne(buildMemberQuery);
    }

    // 3. Try Institution
    if (!user) {
        const Institution = require('../models/Institution');
        user = await Institution.findOne(query);
    }

    if (!user) {
        res.status(404);
        throw new Error('No account found with the provided details');
    }

    // Get email to send to
    let targetEmail = user.email;

    // If it's a dependent, they might have their own email or use head's?
    // Usually, we want the email associated with the login identifier if it's a dependent.
    if (!targetEmail && user.familyMembers) {
        const loginNormalized = isEmail ? normalized.toLowerCase() : normalized;
        const dependent = user.familyMembers.find(fm => {
            if (isEmail) return fm.email && fm.email.toLowerCase() === loginNormalized;
            return normalizeMobile(fm.mobileNumber || '') === loginNormalized;
        });
        if (dependent && dependent.email) targetEmail = dependent.email;
    }

    if (!targetEmail) {
        res.status(400);
        throw new Error('No email address registered for this account. Please contact support.');
    }

    // Generate 4-digit reset code
    const resetCode = Math.floor(1000 + Math.random() * 9000).toString();
    const salt = await bcrypt.genSalt(10);
    user.otpHash = await bcrypt.hash(resetCode, salt);
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    user.otpLastSent = Date.now();
    await user.save();

    // Send Email
    const { sendEmail } = require('../utils/emailService');
    try {
        await sendEmail(
            targetEmail,
            'MEWS Verification Code',
            `Your MEWS Verification Code is: ${resetCode}. Valid for 10 minutes.`,
            `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e1e8ed; border-radius: 12px;">
                <h2 style="color: #1e2a4a; text-align: center;">Verification Code</h2>
                <p>Hello,</p>
                <p>Use the following code to verify your identity and set/reset your password:</p>
                <div style="background-color: #f0f4f8; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                    <h1 style="color: #1e2a4a; letter-spacing: 10px; font-size: 32px; margin: 0;">${resetCode}</h1>
                </div>
                <p style="color: #657786; font-size: 14px;">This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #e1e8ed; margin: 20px 0;" />
                <p style="color: #657786; font-size: 12px; text-align: center;">Regards,<br/>MEWS Team</p>
            </div>`
        );

        res.json({
            message: `Verification code sent to: ${targetEmail.replace(/(.{2})(.*)(?=@)/, (gp1, gp2, gp3) => gp2 + '*'.repeat(gp3.length))}`
        });
    } catch (e) {
        console.error('[ForgotPassword] Email sending failed:', e);
        res.status(500);
        throw new Error('Failed to send verification email. Please try again later.');
    }
});

const resetPassword = asyncHandler(async (req, res) => {
    const { loginInput, resetCode, newPassword } = req.body;

    if (!loginInput || !resetCode || !newPassword) {
        res.status(400);
        throw new Error('All fields are required');
    }

    const isEmail = loginInput.includes('@');
    let normalized = loginInput;
    if (!isEmail) {
        normalized = normalizeMobile(loginInput);
    }

    const query = isEmail ? { email: normalized.toLowerCase() } : {
        $or: [
            { mobileNumber: normalized },
            { mobileNumber: `+91${normalized}` },
            { username: normalized },
            { username: `+91${normalized}` }
        ]
    };

    // 1. Try User
    let user = await User.findOne(query);

    // 2. Try Member
    if (!user) {
        const buildMemberQuery = isEmail ? { email: normalized.toLowerCase() } : {
            $or: [
                { mobileNumber: normalized },
                { mobileNumber: `+91${normalized}` },
                { "familyMembers.mobileNumber": normalized },
                { "familyMembers.mobileNumber": `+91${normalized}` }
            ]
        };
        user = await Member.findOne(buildMemberQuery);
    }

    // 3. Try Institution
    if (!user) {
        const Institution = require('../models/Institution');
        user = await Institution.findOne(query);
    }

    if (!user || !user.otpHash || !user.otpExpires) {
        res.status(400);
        throw new Error('Invalid request or session expired');
    }

    if (user.otpExpires < Date.now()) {
        res.status(400);
        throw new Error('Verification code has expired');
    }

    const isMatch = await bcrypt.compare(resetCode, user.otpHash);
    if (!isMatch) {
        res.status(400);
        throw new Error('Invalid verification code');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.otpHash = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been set successfully. You can now login with your new password.' });
});

module.exports = {
    loginUser,
    changePassword,
    toggleTwoFactor,
    requestOtp,
    verifyOtp,
    logoutUser,
    getMe,
    forgotPassword,
    resetPassword
};
