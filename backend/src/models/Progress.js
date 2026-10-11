const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        lesson: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lesson',
            required: true,
        },
        completed: {
            type: Boolean,
            default: false,
        },
        score: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        stars: {
            type: Number,
            default: 1,
            min: 1,
            max: 3,
        },
        attempts: {
            type: Number,
            default: 1,
        },
        holdTimeAchieved: {
            type: Number,
            default: 1.5,
        },
        completedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Một user chỉ có một bản ghi tiến độ cho mỗi bài học
progressSchema.index({ user: 1, lesson: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
