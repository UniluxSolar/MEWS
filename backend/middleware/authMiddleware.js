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

            // 1. Check Collections (Database)
            const mongoose = require('mongoose');
            let user;

            if (mongoose.Types.ObjectId.isValid(decoded.id)) {
                // Check User (Admin) Collection
                user = await User.findById(decoded.id).select('-passwordHash').populate('memberId', 'photoUrl');

                // 2. If not found in User, check Member (Member Login)
                if (!user) {
                    const Member = require('../models/Member');
                    user = await Member.findById(decoded.id);
                    if (user) {
                        user.role = (user.role || 'MEMBER').toString().trim().toUpperCase();
                    }
                }

                // 3. If not found in Member, check Institution (Institution Login)
                if (!user) {
                    const Institution = require('../models/Institution');
                    user = await Institution.findById(decoded.id);
                    if (user) {
                        user.role = 'INSTITUTION'; 
                    }
                }
            }

            // 4. If not found, check for Synthetic Scrutiny Admin
            if (!user && decoded.id === '507f191e810c19729de860ea') {
                user = {
                    _id: '507f191e810c19729de860ea',
                    username: 'ScrutinyAdmin',
                    email: 'scrutinyadmin@gmail.com',
                    role: 'SCRUTINY_ADMIN'
                };
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
        const userRole = (req.user.role || '').toString().trim().toUpperCase();
        if (!roles.includes(userRole)) {
            return res.status(403).json({ message: `User role ${userRole} is not authorized to access this route` });
        }
        next();
    };
};

module.exports = { protect, authorize };
