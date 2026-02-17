const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // Check Header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // Check Cookie (Preferred)
    else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (token) {
        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

            // 1. Check User (Admin) Collection
            let user = await User.findById(decoded.id).select('-passwordHash');

            // 2. If not found in User, check Member (Member Login)
            if (!user) {
                const Member = require('../models/Member');
                user = await Member.findById(decoded.id);
                // Role handling for Member...
                if (user) {
                    user.role = user.role || 'MEMBER';
                }
            }

            // 3. If not found in Member, check Institution (Institution Login)
            if (!user) {
                const Institution = require('../models/Institution');
                user = await Institution.findById(decoded.id);
                if (user) {
                    user.role = 'INSTITUTION'; // Ensure role is set
                }
            }

            if (!user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            req.user = user;
            req.loggedInMemberId = decoded.memberId;
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: `User role ${req.user.role} is not authorized to access this route` });
        }
        next();
    };
};

module.exports = { protect, authorize };
