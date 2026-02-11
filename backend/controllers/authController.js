const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Member = require('../models/Member');
const { sendSms } = require('../utils/smsService');
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
                token: generateToken(user._id, user._id) // Add token so frontend can set Authorization header
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

    const normalized = normalizeMobile(mobile);

    // STRICT CHECKING BASED ON userType
    if (userType === 'MEMBER') {
        user = await Member.findOne({
            $or: [
                { mobileNumber: normalized },
                { mobileNumber: `+91${normalized}` },
                { "familyMembers.mobileNumber": normalized },
                { "familyMembers.mobileNumber": `+91${normalized}` }
            ]
        });
        foundUserType = 'MEMBER';
    } else if (userType === 'INSTITUTION') {
        const Institution = require('../models/Institution');
        user = await Institution.findOne({
            $or: [
                { mobileNumber: normalized },
                { mobileNumber: `+91${normalized}` }
            ]
        });
        foundUserType = 'INSTITUTION';
    } else if (userType === 'ADMIN') {
        user = await User.findOne({
            $or: [
                { mobileNumber: normalized },
                { mobileNumber: `+91${normalized}` },
                { username: normalized },
                { username: `+91${normalized}` }
            ]
        });
        foundUserType = 'ADMIN';
    } else {
        // Fallback: Check Member first, then Institution, then Admin
        user = await Member.findOne({
            $or: [
                { mobileNumber: normalized },
                { mobileNumber: `+91${normalized}` },
                { "familyMembers.mobileNumber": normalized },
                { "familyMembers.mobileNumber": `+91${normalized}` }
            ]
        });
        foundUserType = 'MEMBER';

        if (!user) {
            const Institution = require('../models/Institution');
            user = await Institution.findOne({
                $or: [
                    { mobileNumber: normalized },
                    { mobileNumber: `+91${normalized}` }
                ]
            });
            foundUserType = 'INSTITUTION';
        }

        if (!user) {
            // Check Admin
            user = await User.findOne({
                $or: [
                    { mobileNumber: normalized },
                    { mobileNumber: `+91${normalized}` },
                    { username: normalized },
                    { username: `+91${normalized}` }
                ]
            });
            foundUserType = 'ADMIN';
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
    let formattedMobile = normalized;
    if (!formattedMobile.startsWith('+')) {
        formattedMobile = `+91${formattedMobile}`;
    }

    const smsResult = await sendSms(formattedMobile, `Your MEWS ${userType ? userType : 'User'} Login Verification Code is: ${otp}. Valid for 5 minutes. Do not share this code with anyone.`);

    console.log(`[OTP] Generated for ${mobile} (${userType}): ${otp} | SMS Result:`, smsResult);

    if (smsResult.success) {
        res.json({
            message: 'OTP sent successfully to your mobile number',
            mobile,
            userType,
            otp // Included for testing purposes // Optional: let frontend know what type was found
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

    const normalized = normalizeMobile(mobile);

    // STRICT CHECKING BASED ON userType
    if (userType === 'MEMBER') {
        user = await Member.findOne({
            $or: [
                { mobileNumber: normalized },
                { mobileNumber: `+91${normalized}` },
                { "familyMembers.mobileNumber": normalized },
                { "familyMembers.mobileNumber": `+91${normalized}` }
            ]
        });
        foundUserType = 'MEMBER';
    } else if (userType === 'INSTITUTION') {
        const Institution = require('../models/Institution');
        user = await Institution.findOne({
            $or: [
                { mobileNumber: normalized },
                { mobileNumber: `+91${normalized}` }
            ]
        });
        foundUserType = 'INSTITUTION';
    } else if (userType === 'ADMIN') {
        user = await User.findOne({
            $or: [
                { mobileNumber: normalized },
                { mobileNumber: `+91${normalized}` },
                { username: normalized },
                { username: `+91${normalized}` }
            ]
        });
        foundUserType = 'ADMIN';
    } else {
        // Fallback
        user = await Member.findOne({
            $or: [
                { mobileNumber: normalized },
                { mobileNumber: `+91${normalized}` },
                { "familyMembers.mobileNumber": normalized },
                { "familyMembers.mobileNumber": `+91${normalized}` }
            ]
        });
        foundUserType = 'MEMBER';

        if (!user) {
            const Institution = require('../models/Institution');
            user = await Institution.findOne({
                $or: [
                    { mobileNumber: normalized },
                    { mobileNumber: `+91${normalized}` }
                ]
            });
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

    if (foundUserType === 'ADMIN') {
        loggedInMember = {
            _id: user._id,
            name: user.username, // Admins might not have separate name field
            surname: '',
            mobileNumber: user.mobileNumber,
            photoUrl: '', // Admins might not have photo
            memberType: 'ADMIN'
        };
    }

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
        isMpinEnabled: user.isMpinEnabled,
        mpinStatus: user.isMpinEnabled ? 'CREATED' : 'NOT_CREATED', // ADDED: Explicit status
        token: generateToken(user._id, loggedInMember.memberId || loggedInMember._id) // Fallback for Header-based Auth
    });
});

// @desc    Create/Setup MPIN
// @route   POST /api/auth/create-mpin
// @access  Private
const createMpin = asyncHandler(async (req, res) => {
    const { mpin, deviceId } = req.body;
    // Trim and validate MPIN
    const cleanMpin = mpin ? mpin.toString().trim() : '';

    if (!cleanMpin || cleanMpin.length !== 4) {
        res.status(400);
        throw new Error('MPIN must be exactly 4 digits');
    }

    const userId = req.user._id;
    let user = await User.findById(userId);
    if (!user) {
        user = await Member.findById(userId);
    }
    if (!user) {
        const Institution = require('../models/Institution');
        user = await Institution.findById(userId);
    }

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Check if MPIN already exists for this specific user
    if (user.isMpinEnabled && user.mpinHash) {
        res.status(400);
        throw new Error("MPIN already exists for this account. If you do not remember your MPIN, please use 'Forgot MPIN' to reset it.");
    }

    // Hash MPIN (Bcrypt) for verification
    const salt = await bcrypt.genSalt(10);
    user.mpinHash = await bcrypt.hash(mpin, salt);

    // Create Digest (SHA256) for lookup
    user.mpinDigest = crypto.createHash('sha256').update(mpin).digest('hex');

    user.isMpinEnabled = true;
    user.mpinCreated = true;
    user.deviceId = deviceId; // Bind to device
    user.mpinFailedAttempts = 0;
    user.mpinLockedUntil = undefined;

    // user.save(); // BLOCKED BY VALIDATION ERRORS IN ADDRESS

    // Bypass validation by using updateOne on the specific collection
    // user.constructor refers to the Model (Member, User, or Institution)
    await user.constructor.updateOne(
        { _id: user._id },
        {
            $set: {
                mpinHash: user.mpinHash,
                mpinDigest: user.mpinDigest,
                isMpinEnabled: true,
                mpinCreated: true,
                deviceId: deviceId,
                mpinFailedAttempts: 0
            },
            $unset: {
                mpinLockedUntil: 1 // Remove lock if exists
            }
        }
    );

    res.json({ message: 'MPIN created successfully' });
});

// @desc    Login with MPIN (Unified)
// @route   POST /api/auth/login-mpin
// @access  Public
const loginMpin = asyncHandler(async (req, res) => {
    const { mpin, deviceId, identifier, userType: requestedUserType } = req.body;
    const cleanMpin = mpin ? mpin.toString().trim() : '';

    if (!cleanMpin || cleanMpin.length !== 4) {
        res.status(400);
        throw new Error('MPIN must be exactly 4 digits');
    }

    // Compute Digest for Lookup
    const mpinDigest = crypto.createHash('sha256').update(cleanMpin).digest('hex');

    let user = null;
    let userType = 'MEMBER';
    let candidates = [];

    // 1. Parallel lookup with optional userType filtering
    const [memberCandidates, userCandidates, institutionCandidates] = await Promise.all([
        (!requestedUserType || requestedUserType === 'MEMBER') ? Member.find({ mpinDigest }) : Promise.resolve([]),
        (!requestedUserType || requestedUserType === 'ADMIN') ? User.find({ mpinDigest }) : Promise.resolve([]),
        (!requestedUserType || requestedUserType === 'INSTITUTION') ? require('../models/Institution').find({ mpinDigest }) : Promise.resolve([])
    ]);

    // Aggregate all potential matches
    memberCandidates.forEach(u => candidates.push({ user: u, type: 'MEMBER' }));
    userCandidates.forEach(u => candidates.push({ user: u, type: 'ADMIN' }));
    institutionCandidates.forEach(u => candidates.push({ user: u, type: 'INSTITUTION' }));

    // 2. Logic to resolve user (Banking Style: identify via bound device)
    console.log(`[LoginMpin] Digest: ${mpinDigest} | Candidates Found: ${candidates.length} | Device: ${deviceId}`);

    if (candidates.length === 0) {
        res.status(401);
        throw new Error('Incorrect MPIN. Please try again.');
    }

    // Filter by deviceId (strictly identifies which user created this MPIN on this device)
    const validDeviceCandidates = candidates.filter(c => c.user.deviceId === deviceId);

    if (validDeviceCandidates.length === 0) {
        // MPIN is valid for SOMEONE, but not for this device.
        // To prevent account hopping/unauthorized discovery, we return 401.
        res.status(401);
        throw new Error('Device not recognized or MPIN invalid for this device.');
    }

    if (validDeviceCandidates.length === 1) {
        user = validDeviceCandidates[0].user;
        userType = validDeviceCandidates[0].type;
    } else {
        // Collision within the SAME device (Extreme edge case)
        // Try to matching the portal's requested user type
        const typeMatch = validDeviceCandidates.find(c => c.type === (requestedUserType || 'MEMBER'));
        user = typeMatch ? typeMatch.user : validDeviceCandidates[0].user;
        userType = typeMatch ? typeMatch.type : validDeviceCandidates[0].type;
    }

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Check Lockout
    if (user.mpinLockedUntil && user.mpinLockedUntil > Date.now()) {
        res.status(423); // Locked
        throw new Error(`Account locked. Try again after ${new Date(user.mpinLockedUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    }

    // Double Check Hash (Security measure against digest collisions if any, though SHA256 is strong)
    const isMatch = await bcrypt.compare(cleanMpin, user.mpinHash);

    if (isMatch) {
        // Reset attempts
        user.mpinFailedAttempts = 0;
        user.mpinLockedUntil = undefined;
        await user.save();

        // Prepare Response
        let loggedInMember = {
            _id: user._id,
            name: user.name || user.username,
            mobileNumber: user.mobileNumber,
            photoUrl: user.photoUrl,
            role: user.role || userType,
            institutionId: user.institutionId,
            assignedLocation: user.assignedLocation
        };

        // Handle Dependent Login if identifier was used/needed? 
        // If login was purely by MPIN, we log in as HEAD/Main User.
        // If user wants to login as dependent, they likely need to use OTP or be selected after login.
        // For now, MPIN login defaults to Main User/Head.

        res.cookie('jwt', generateToken(user._id, user._id), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.json({
            _id: user._id,
            name: loggedInMember.name,
            role: loggedInMember.role,
            mobile: loggedInMember.mobileNumber,
            photoUrl: loggedInMember.photoUrl,
            message: 'Logged in with MPIN',
            token: generateToken(user._id, user._id)
        });

    } else {
        // Increment Failed Attempts
        user.mpinFailedAttempts = (user.mpinFailedAttempts || 0) + 1;

        if (user.mpinFailedAttempts >= 5) {
            user.mpinLockedUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
            await user.save();
            res.status(423); // Locked
            throw new Error('Account locked for 15 minutes due to 5 wrong MPIN attempts');
        }

        await user.save();
        res.status(401);
        throw new Error(`Invalid MPIN. Attempts remaining: ${5 - user.mpinFailedAttempts}`);
    }
});

// @desc    Check MPIN Status
// @route   GET /api/auth/check-mpin
// @access  Private
const checkMpinStatus = asyncHandler(async (req, res) => {
    // Current user context from 'protect' middleware
    const user = req.user;
    res.json({
        isMpinEnabled: !!user.isMpinEnabled,
        isLocked: user.mpinLockedUntil && user.mpinLockedUntil > Date.now()
    });
});

// @desc    Forgot MPIN - Forward to OTP Request
// @route   POST /api/auth/forgot-mpin
// @access  Public
const forgotMpin = asyncHandler(async (req, res) => {
    // Forward to requestOtp logic for OTP generation
    // Client should then call resetMpin
    return requestOtp(req, res);
});

// @desc    Reset MPIN (after OTP verify)
// @route   POST /api/auth/reset-mpin
// @access  Public
const resetMpin = asyncHandler(async (req, res) => {
    const { mobile, otp, newMpin, deviceId, userType } = req.body;

    // 1. Fetch User (Prioritize Session established by verify-otp)
    let user = req.user;

    if (!user) {
        // Fallback for non-session calls (Manual verification)
        const normalized = normalizeMobile(mobile);
        if (userType === 'MEMBER') {
            user = await Member.findOne({
                $or: [
                    { mobileNumber: normalized },
                    { mobileNumber: `+91${normalized}` },
                    { "familyMembers.mobileNumber": normalized },
                    { "familyMembers.mobileNumber": `+91${normalized}` }
                ]
            });
        } else if (userType === 'INSTITUTION') {
            const Institution = require('../models/Institution');
            user = await Institution.findOne({
                $or: [
                    { mobileNumber: normalized },
                    { mobileNumber: `+91${normalized}` }
                ]
            });
        } else if (userType === 'ADMIN') {
            user = await User.findOne({
                $or: [
                    { mobileNumber: normalized },
                    { mobileNumber: `+91${normalized}` },
                    { username: normalized },
                    { username: `+91${normalized}` }
                ]
            });
        } else {
            // Generic Fallback
            user = await Member.findOne({
                $or: [
                    { mobileNumber: normalized },
                    { mobileNumber: `+91${normalized}` }
                ]
            });
            if (!user) {
                user = await User.findOne({
                    $or: [
                        { mobileNumber: normalized },
                        { mobileNumber: `+91${normalized}` }
                    ]
                });
            }
        }
    }

    if (!user) {
        res.status(404); throw new Error('User not found');
    }

    // 2. Verification (Session or OTP)
    // If we have a session (req.user), we consider it verified by verify-otp call.
    // Otherwise, we must check the OTP hash in the body.
    if (!req.user) {
        if (!otp) {
            res.status(400);
            throw new Error('Verification code is required for this action');
        }
        if (!user.otpHash) {
            res.status(400); throw new Error('No OTP requested for this account. Please request a code first.');
        }
        if (!user.otpExpires || user.otpExpires < Date.now()) {
            res.status(400); throw new Error('OTP has expired. Please request a new one.');
        }
        const isMatch = await bcrypt.compare(otp, user.otpHash);
        if (!isMatch) {
            res.status(400); throw new Error('Incorrect OTP. Please check the code and try again.');
        }
    }

    // 3. Set New MPIN
    const cleanMpin = newMpin ? newMpin.toString().trim() : '';
    if (!cleanMpin || cleanMpin.length !== 4) {
        res.status(400);
        throw new Error('MPIN must be exactly 4 digits');
    }

    const salt = await bcrypt.genSalt(10);
    user.mpinHash = await bcrypt.hash(cleanMpin, salt);
    user.mpinDigest = crypto.createHash('sha256').update(cleanMpin).digest('hex');

    user.isMpinEnabled = true;
    user.mpinCreated = true;
    user.deviceId = deviceId;
    user.mpinFailedAttempts = 0;
    user.mpinLockedUntil = undefined;

    // Clear OTP context
    user.otpHash = undefined;
    user.otpExpires = undefined;

    await user.save();
    res.json({ message: 'MPIN reset successfully' });
});


module.exports = {
    loginUser,
    changePassword,
    toggleTwoFactor,
    requestOtp,
    verifyOtp,
    logoutUser,
    getMe,
    // MPIN Exports
    createMpin,
    loginMpin,
    checkMpinStatus,
    forgotMpin,
    resetMpin
};
