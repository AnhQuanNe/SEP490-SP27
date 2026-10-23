const mongoose = require('mongoose');

const guestUsageSchema = new mongoose.Schema(
    {
        identifier: {
            type: String,
            required: true,
            index: true,
        },
        ip: {
            type: String,
            default: '',
        },
        date: {
            type: String,
            required: true,
            index: true, // Định dạng YYYY-MM-DD
        },
        count: {
            type: Number,
            default: 0,
        },
        lastUsedAt: {
            type: Date,
            default: Date.now,
        },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 172800, // Tự động xóa sau 48 giờ (2 ngày)
        },
    },
    {
        timestamps: false,
    }
);

// Tạo unique index để đảm bảo mỗi khách chỉ có 1 bản ghi đếm mỗi ngày
guestUsageSchema.index({ identifier: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('GuestUsage', guestUsageSchema);
