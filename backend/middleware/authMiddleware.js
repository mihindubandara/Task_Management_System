const jwt = require('jsonwebtoken');

// Check login token
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'No token provided'
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            message: 'Invalid or expired token'
        });
    }
};


// Check admin role
const adminOnly = (req, res, next) => {

    if (!req.user || req.user.role !== 'Admin') {
        return res.status(403).json({
            message: 'Admin access required'
        });
    }

    next();
};


module.exports = {
    authMiddleware,
    adminOnly
};