const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { generateToken, generateOTP, generateRandomToken } = require('../utils/auth.utils');
const { sendVerificationEmail, sendResetPasswordEmail } = require('./email.service');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Đăng ký tài khoản mới (tạo tài khoản và trả về JWT token để vào luôn hệ thống)
 */
const register = async ({ name, email, password }) => {
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
        throw new Error('Email này đã được sử dụng');
    }

    const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        isVerified: false,
    });

    const token = generateToken(user._id);

    return {
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            phone: user.phone,
            address: user.address,
            isVerified: user.isVerified,
        },
        message: 'Đăng ký tài khoản thành công',
    };
};

/**
 * Xác thực email bằng mã OTP
 */
const verifyEmail = async ({ email, otp }) => {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
        throw new Error('Không tìm thấy tài khoản với email này');
    }

    if (user.isVerified) {
        return {
            token: generateToken(user._id),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                role: user.role,
                isVerified: true,
            },
            message: 'Tài khoản đã được xác thực từ trước',
        };
    }

    if (user.verificationCode !== otp) {
        throw new Error('Mã xác thực OTP không chính xác');
    }

    if (user.verificationExpires && user.verificationExpires < Date.now()) {
        throw new Error('Mã xác thực OTP đã hết hạn. Vui lòng yêu cầu mã mới');
    }

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationExpires = null;
    await user.save();

    const token = generateToken(user._id);

    return {
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            isVerified: true,
        },
        message: 'Xác thực tài khoản thành công',
    };
};

/**
 * Gửi lại mã OTP xác thực email
 */
const resendVerificationCode = async ({ email }) => {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
        throw new Error('Không tìm thấy tài khoản với email này');
    }

    if (user.isVerified) {
        throw new Error('Tài khoản này đã được xác thực rồi');
    }

    const otp = generateOTP();
    user.verificationCode = otp;
    user.verificationExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(user.email, otp);

    return {
        message: 'Đã gửi lại mã xác thực mới vào email của bạn',
    };
};

/**
 * Đăng nhập thông thường (Email + Password)
 */
const login = async ({ email, password }) => {
    // Cần select: '+password' vì trong schema đã cấu hình select: false
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
        throw new Error('Email hoặc mật khẩu không chính xác');
    }

    // Nếu là user đăng nhập bằng Google và chưa từng đặt password
    if (!user.password) {
        throw new Error('Tài khoản này được đăng ký bằng Google. Vui lòng đăng nhập với Google');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new Error('Email hoặc mật khẩu không chính xác');
    }

    // Cho phép đăng nhập ngay không cần kích hoạt OTP
    const token = generateToken(user._id);

    return {
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            phone: user.phone,
            address: user.address,
            isVerified: user.isVerified,
        },
    };
};

/**
 * Đăng nhập / Đăng ký bằng Google ID Token (Google Identity Services)
 */
const googleLogin = async ({ idToken }) => {
    if (!idToken) {
        throw new Error('Thiếu Google ID Token');
    }

    let payload;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID || undefined,
        });
        payload = ticket.getPayload();
    } catch (err) {
        // Nếu ở dev mode và chưa cấu hình GOOGLE_CLIENT_ID, vẫn parse để test nếu cần
        console.error('[Google Auth] Lỗi verify ID Token:', err.message);
        throw new Error('Token Google không hợp lệ hoặc đã hết hạn');
    }

    const { email, name, picture, sub: googleId } = payload;

    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
        // Đã có tài khoản: liên kết googleId và avatar nếu chưa có
        if (!user.googleId) {
            user.googleId = googleId;
        }
        if (!user.avatar && picture) {
            user.avatar = picture;
        }
        user.isVerified = true; // Tài khoản Google mặc định đã xác minh email
        await user.save();
    } else {
        // Tạo tài khoản mới bằng Google
        user = await User.create({
            name: name || 'Google User',
            email: email.toLowerCase(),
            avatar: picture || '',
            googleId,
            isVerified: true,
            role: 'customer',
        });
    }

    const token = generateToken(user._id);

    return {
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            phone: user.phone,
            address: user.address,
            isVerified: user.isVerified,
        },
    };
};

/**
 * Yêu cầu quên mật khẩu
 */
const forgotPassword = async ({ email }) => {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
        // Để bảo mật, không báo lộ là email có tồn tại hay không
        return {
            message: 'Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi đến bạn.',
        };
    }

    const resetToken = generateRandomToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 phút
    await user.save();

    await sendResetPasswordEmail(user.email, resetToken);

    return {
        message: 'Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi đến bạn.',
    };
};

/**
 * Đặt lại mật khẩu mới bằng token
 */
const resetPassword = async ({ email, token, newPassword }) => {
    const user = await User.findOne({
        email: email.toLowerCase(),
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
    }).select('+password');

    if (!user) {
        throw new Error('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return {
        message: 'Đặt lại mật khẩu thành công. Bây giờ bạn có thể đăng nhập bằng mật khẩu mới.',
    };
};

module.exports = {
    register,
    verifyEmail,
    resendVerificationCode,
    login,
    googleLogin,
    forgotPassword,
    resetPassword,
};
