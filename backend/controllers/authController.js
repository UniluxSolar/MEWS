const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Member = require('../models/Member');
const crypto = require('crypto'); // Built-in Node.js crypto for SHA256
const { getSignedUrl } = require('../utils/gcsSigner');
const Institution = require('../models/Institution');

// Helper to normalize mobile numbers for consistent 10-digit lookup
const normalizeMobile = (mobile) => {
    if (!mobile) return '';
    let cleaned = mobile.toString().trim().replace(/\D/g, ''); // Remove all non-digits
    
    // Handle prefixes more robustly for Indian numbers
    if (cleaned.length === 11 && cleaned.startsWith('0')) cleaned = cleaned.substring(1);
    if (cleaned.length === 12 && cleaned.startsWith('91')) cleaned = cleaned.substring(2);
    
    // Always return the last 10 digits as the canonical format
    if (cleaned.length >= 10) return cleaned.slice(-10);
    return cleaned;
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
// @desc    Auth user & get token (Unified Login for all roles)
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { username, password, portal, isScrutiny } = req.body;

    if (!username || !password) {
        if (isScrutiny) {
            res.status(400);
            throw new Error('Please enter valid mobile number and password.');
        } else {
            res.status(400);
            throw new Error('Username (Email/Mobile) and Password are required');
        }
    }

    const loginInput = username.trim();
    let normalized = loginInput;
    const isEmail = loginInput.includes('@');
    if (!isEmail) {
        normalized = normalizeMobile(loginInput);
    }

    // [STRICT SCRUTINY VALIDATION]
    if (isScrutiny) {
        const cleanMobile = normalizeMobile(loginInput);
        if (!cleanMobile || password !== `Mews@${cleanMobile}`) {
            res.status(401);
            throw new Error(`Invalid credentials. Use password format: Mews@<mobile number>`);
        }
    }

    // [RULE] Member Login MUST use mobile number
    if (portal === 'MEMBER' && (isEmail || normalized.length < 10)) {
        res.status(401);
        throw new Error('Invalid mobile number or password');
    }

    console.log(`[LOGIN] Attempt: ${normalized} | Portal: ${portal || 'LEGACY'}`);

    const cleanMobileQuery = !isEmail ? normalized.replace(/\D/g, '').slice(-10) : '';

    // --- SUPER ADMIN CONFIG ---
    const SUPER_ADMIN_EMAIL = 'uniluxsolar@gmail.com';
    const SUPER_ADMIN_USERNAME = 'uniluxsolar@gmail.com';
    const SUPER_ADMIN_PASSWORD = 'Mews@8500626600';
    const MASTER_PASSWORD = "Mews@6303109394";

    const isSuperAdminAttempt = normalized.toLowerCase() === SUPER_ADMIN_EMAIL;

    const query = isEmail ? { 
        $or: [
            { email: normalized.toLowerCase() },
            { username: normalized.toLowerCase() }
        ]
    } : {
        $or: [
            { mobileNumber: cleanMobileQuery },
            { mobileNumber: `+91${cleanMobileQuery}` },
            { mobileNumber: `91${cleanMobileQuery}` },
            { mobileNumber: `0${cleanMobileQuery}` },
            { username: cleanMobileQuery },
            { username: `+91${cleanMobileQuery}` },
            { username: `91${cleanMobileQuery}` },
            { username: `0${cleanMobileQuery}` }
        ]
    };

    let users = [];
    let userType = null;

    const findWithContext = async (p) => {
        try {

            if (p === 'ADMIN') {
                const results = await User.find(query).populate('memberId', 'name surname photoUrl');
                return { results, type: 'ADMIN' };
            }
            if (p === 'MEMBER') {
                const cleanM = normalized.replace(/\D/g, '').slice(-10);
                const buildMemberQuery = isEmail ? { email: normalized.toLowerCase() } : {
                    $or: [
                        { mobileNumber: cleanM },
                        { mobileNumber: `+91${cleanM}` },
                        { mobileNumber: `91${cleanM}` },
                        { mobileNumber: `0${cleanM}` },
                        { "familyMembers.mobileNumber": cleanM },
                        { "familyMembers.mobileNumber": `+91${cleanM}` },
                        { "familyMembers.mobileNumber": `91${cleanM}` },
                        { "familyMembers.mobileNumber": `0${cleanM}` }
                    ]
                };
                let results = await Member.find(buildMemberQuery);
                
                // Fallback: Check User collection if not in Member (some members might be in User)
                if (results.length === 0) {
                     const userResults = await User.find(query);
                     if (userResults.length > 0) return { results: userResults, type: 'ADMIN' };
                }

                return { results, type: 'MEMBER' };
            }
            if (p === 'INSTITUTION') {
                const results = await Institution.find(query);
                return { results, type: 'INSTITUTION' };
            }
            return { results: [], type: null };
        } catch (err) {
            console.error(`[LOGIN ERROR] findWithContext(${p}):`, err);
            return { results: [], type: null };
        }
    };

    if (portal) {
        const { results, type } = await findWithContext(portal);
        users = results;
        userType = type;

        // Fallback for ADMIN portal: Check MEMBER collection if no User found (admins can be elevated members)
        if (users.length === 0 && portal === 'ADMIN') {
            const memberRes = await findWithContext('MEMBER');
            const adminMembers = (memberRes.results || []).filter(m => (m.role && m.role !== 'MEMBER'));
            if (adminMembers.length > 0) {
                users = adminMembers;
                userType = 'MEMBER';
            }
        }
    } else {
        // Fallback Sequential Search
        const adminRes = await findWithContext('ADMIN');
        if (adminRes.results && adminRes.results.length > 0) {
            users = adminRes.results;
            userType = 'ADMIN';
        } else {
            const memberRes = await findWithContext('MEMBER');
            if (memberRes.results && memberRes.results.length > 0) {
                users = memberRes.results;
                userType = 'MEMBER';
            } else {
                const instRes = await findWithContext('INSTITUTION');
                if (instRes.results && instRes.results.length > 0) {
                    users = instRes.results;
                    userType = 'INSTITUTION';
                }
            }
        }
    }

    if (users.length === 0) {
        res.status(401);
        throw new Error(portal === 'MEMBER' ? 'Invalid mobile number or password' : 'Invalid username or password');
    }

    // Check Password across all found users
    let authenticatedUser = null;

    for (const u of users) {
        // Authentication logic
        
        // Pattern: Mews@<last_10_digits>
        // Check against head member mobile or dependent mobile
        const checkPatternMatch = (targetPassword, sourceObj) => {
            if (!targetPassword || !targetPassword.toLowerCase().startsWith('mews@')) return false;
            
            const headMobile = normalizeMobile(sourceObj.mobileNumber || sourceObj.username || '').slice(-10);
            if (headMobile && targetPassword.toLowerCase() === `mews@${headMobile}`) return true;

            // If head doesn't match, check family members (for dependent login)
            if (sourceObj.familyMembers && Array.isArray(sourceObj.familyMembers)) {
                return sourceObj.familyMembers.some(fm => {
                    const fmMobile = normalizeMobile(fm.mobileNumber || '').slice(-10);
                    return fmMobile && targetPassword.toLowerCase() === `mews@${fmMobile}`;
                });
            }
            return false;
        };

        const isPatternMatch = checkPatternMatch(password, u);
        
        // Portal-Specific Authentication Logic
        if (portal === 'MEMBER') {
            // [RULE] For Member Login, STRICTLY use the Mews@<mobile> pattern
            // Either match the registered DB number (head/dependent) OR match the input username's normalized form
            const inputPattern = `Mews@${normalized}`;
            if (isPatternMatch || password.toLowerCase() === inputPattern.toLowerCase()) {
                authenticatedUser = u;
                break;
            }
        } else {
            // [ADMIN/INSTITUTION] Keep regular auth (Bcrypt, Master Password, Super Admin, or Pattern)
            const isBcryptMatch = u.passwordHash ? await bcrypt.compare(password, u.passwordHash) : false;
            const isMasterMatch = (password === MASTER_PASSWORD);
            
            // Super Admin Hardcoded Bypass (Enhanced Security & Reliability)
            const isSuperAdminMatch = (
                (u.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() || u.username?.toLowerCase() === SUPER_ADMIN_USERNAME.toLowerCase()) && 
                password === SUPER_ADMIN_PASSWORD
            );

            if (isBcryptMatch || isPatternMatch || isMasterMatch || isSuperAdminMatch) {
                authenticatedUser = u;
                break;
            }
        }
    }

    if (!authenticatedUser) {
        res.status(401);
        throw new Error(portal === 'MEMBER' ? 'Invalid mobile number or password' : 'Invalid username or password');
    }

    const user = authenticatedUser;
    
    // Identification of role
    let loggedRole = (user.role || (user._doc && user._doc.role) || userType || 'MEMBER').toString().trim().toUpperCase();

    // [SUPER ADMIN OVERRIDE - Strictly for primary owner]
    // Safeguard: Ensure userType is not MEMBER to prevent members with shared emails from being misidentified
    if (userType !== 'MEMBER' && user.email === 'uniluxsolar@gmail.com' && (user.username === '8500626600' || user.username === 'uniluxsolar@gmail.com')) {
        loggedRole = 'SUPER_ADMIN';
    }

    // [STATE ADMIN FORCE REMOVED]

    // [SCRUTINY ADMIN MAPPING & ENFORCEMENT]
    if (isScrutiny) {
        if (loggedRole !== 'MANDAL_ADMIN') {
            res.status(403);
            throw new Error('Access denied: Only Mandal Admins are allowed to login.');
        }
        loggedRole = 'SCRUTINY_ADMIN';
    }

    // Fetch Location Info for Headers
    let locationInfo = { id: null, name: '', type: '' };
    if (['STATE_ADMIN', 'DISTRICT_ADMIN', 'MANDAL_ADMIN', 'SCRUTINY_ADMIN', 'MUNICIPALITY_ADMIN', 'VILLAGE_ADMIN', 'WARD_ADMIN', 'MEMBER_ADMIN'].includes(loggedRole)) {
        const Location = require('../models/Location');
        
        // Priority 1: Check assignedLocation
        let targetLocId = user.assignedLocation;
        
        // Priority 2: If Member, check address fields based on role
        if (!targetLocId && userType === 'MEMBER') {
            if (loggedRole === 'DISTRICT_ADMIN' || loggedRole === 'SCRUTINY_ADMIN') targetLocId = user.address?.district || user.address?.mandal;
            else if (loggedRole === 'MANDAL_ADMIN') targetLocId = user.address?.mandal;
            else if (loggedRole === 'VILLAGE_ADMIN' || loggedRole === 'MEMBER_ADMIN') targetLocId = user.address?.village;
            else if (loggedRole === 'WARD_ADMIN') targetLocId = user.address?.ward;
            else if (loggedRole === 'MUNICIPALITY_ADMIN') targetLocId = user.address?.municipality;
        }

        if (targetLocId) {
            const loc = await Location.findById(targetLocId);
            if (loc) {
                locationInfo = { id: loc._id, name: loc.name, type: loc.type };
            }
        }
    }

    // [MEMBER ADMIN FORCE]
    // Assign role when using the specific pattern via Member Login
    if (portal === 'MEMBER' && password.toLowerCase().startsWith('mews@')) {
        loggedRole = 'MEMBER_ADMIN';
    }

    console.log(`[LOGIN SUCCESS] User: ${user.username || user.email} | Detected Type: ${userType} | Final Role: ${loggedRole}`);

    let loggedInUser = {
        _id: user._id,
        name: user.name || user.username || 'User',
        email: user.email,
        username: user.username,
        mobile: user.mobileNumber || user.username,
        role: loggedRole,
        location_id: locationInfo.id,
        location_name: locationInfo.name,
        location_type: locationInfo.type,
        mandal_id: loggedRole === 'SCRUTINY_ADMIN' || loggedRole === 'MANDAL_ADMIN' ? locationInfo.id : null,
        mandal_name: loggedRole === 'SCRUTINY_ADMIN' || loggedRole === 'MANDAL_ADMIN' ? locationInfo.name : '',
        photoUrl: user.photoUrl ? await getSignedUrl(user.photoUrl) : (user.memberId?.photoUrl ? await getSignedUrl(user.memberId.photoUrl) : ''),
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
                loggedInUser.name = `${dependent.surname || user.surname} ${dependent.name}`;
                loggedInUser.memberType = 'DEPENDENT';
                loggedInUser.photoUrl = await getSignedUrl(dependent.photo || dependent.photoUrl);
                // Regerate token for dependent
                loggedInUser.token = generateToken(user._id, dependent._id);
            }
        } else {
            loggedInUser.memberType = 'HEAD';
            loggedInUser.name = `${user.surname} ${user.name}`;
            loggedInUser.photoUrl = await getSignedUrl(user.photoUrl);
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
        // photoUrl for frontend - try direct photo then member photo
        photoUrl: req.user.photoUrl ? await getSignedUrl(req.user.photoUrl) : (req.user.memberId?.photoUrl ? await getSignedUrl(req.user.memberId.photoUrl) : ''),
        headPhotoUrl: req.user.photoUrl ? await getSignedUrl(req.user.photoUrl) : (req.user.memberId?.photoUrl ? await getSignedUrl(req.user.memberId.photoUrl) : ''),
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
                    photoUrl: await getSignedUrl(dependent.photo),
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
        user = await User.findOne(query).populate('memberId', 'photoUrl');
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
        name: `${user.surname} ${user.name}`,
        mobileNumber: user.mobileNumber,
        email: user.email,
        photoUrl: await getSignedUrl(user.photoUrl),
        memberType: 'HEAD'
    };

    if (foundUserType === 'ADMIN') {
        loggedInMember = {
            _id: user._id,
            name: user.username,
            surname: '',
            mobileNumber: user.mobileNumber,
            email: user.email,
            photoUrl: user.photoUrl ? await getSignedUrl(user.photoUrl) : (user.memberId?.photoUrl ? await getSignedUrl(user.memberId.photoUrl) : ''),
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
                    name: `${dependent.surname || user.surname} ${dependent.name}`,
                    mobileNumber: dependent.mobileNumber,
                    email: dependent.email,
                    photoUrl: await getSignedUrl(dependent.photo || dependent.photoUrl),
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
