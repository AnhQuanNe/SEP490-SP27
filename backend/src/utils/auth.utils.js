const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Tạo JWT token cho người dùng
 */
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET || 'fallback_secret_sep490',
        {
            expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        }
    );
};

/**
 * Sinh mã OTP gồm 6 chữ số ngẫu nhiên
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Sinh chuỗi token ngẫu nhiên an toàn cho Reset Password
 */
const generateRandomToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

module.exports = {
    generateToken,
    generateOTP,
    generateRandomToken,
};
