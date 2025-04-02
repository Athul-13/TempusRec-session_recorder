const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ 
                message: 'Not authorized to access this route',
                action: 'LOGOUT'
            });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            res.clearCookie('token');
            return res.status(401).json({ 
                message: 'User not found',
                action: 'LOGOUT'
            });
        }

        if (user.status === 'inactive') {
            res.clearCookie('token');
            return res.status(403).json({ 
                message: 'Your account has been blocked.',
                action: 'LOGOUT'
            });
        }

        req.user = user;
        next();
    } catch (err) {
        res.clearCookie('token');
        return res.status(401).json({ 
            message: 'Invalid or expired token',
            action: 'LOGOUT'
        });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({message: 'Not authorized to access this route'});
        }
        next();
    };
};

module.exports = { protect, authorize };