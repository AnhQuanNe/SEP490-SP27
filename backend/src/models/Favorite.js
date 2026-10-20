const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        work: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Work',
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Tránh lưu trùng lặp cùng 1 tác phẩm cho 1 user
favoriteSchema.index({ user: 1, work: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
