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

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-passwordHash');

            if (!req.user) {
                // If not found in User, check Member (for Member Login)
                const Member = require('../models/Member');
                req.user = await Member.findById(decoded.id);
                if (req.user && !req.user.role) req.user.role = 'MEMBER';
            }

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

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
