const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Vui lòng nhập họ và tên'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Vui lòng nhập địa chỉ email'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Vui lòng nhập email hợp lệ',
            ],
        },
        password: {
            type: String,
            minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
            select: false, // Mặc định không trả về password khi query
        },
        avatar: {
            type: String,
            default: '',
        },
        phone: {
            type: String,
            default: '',
            trim: true,
        },
        address: {
            type: String,
            default: '',
            trim: true,
        },
        role: {
            type: String,
            enum: ['learner', 'deaf', 'educator', 'admin', 'customer', 'staff'],
            default: 'learner',
        },
        xp: {
            type: Number,
            default: 0,
        },
        streak: {
            type: Number,
            default: 1,
        },
        level: {
            type: Number,
            default: 1,
        },
        lastActiveDate: {
            type: Date,
            default: Date.now,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        googleId: {
            type: String,
            default: null,
        },
        // Mã OTP xác thực email khi đăng ký
        verificationCode: {
            type: String,
            default: null,
        },
        verificationExpires: {
            type: Date,
            default: null,
        },
        // Token reset mật khẩu khi quên mật khẩu
        resetPasswordToken: {
            type: String,
            default: null,
        },
        resetPasswordExpires: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Mã hoá mật khẩu trước khi lưu nếu trường password có thay đổi
userSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Phương thức so sánh mật khẩu
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
