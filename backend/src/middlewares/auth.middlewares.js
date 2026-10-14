const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware xác thực JWT token của người dùng
 */
const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Vui lòng đăng nhập để truy cập tính năng này',
        });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'fallback_secret_sep490'
        );

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Tài khoản không tồn tại hoặc đã bị xóa',
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn',
        });
    }
};

/**
 * Middleware kiểm tra phân quyền (Role-based access control)
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền thực hiện thao tác này',
            });
        }
        next();
    };
};

module.exports = {
    protect,
    authorize,
};
