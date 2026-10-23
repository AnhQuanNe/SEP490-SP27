const mongoose = require('mongoose');

const quizProgressSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
            index: true,
        },
        totalQuizzes: {
            type: Number,
            default: 0,
        },
        totalQuestions: {
            type: Number,
            default: 0,
        },
        totalCorrect: {
            type: Number,
            default: 0,
        },
        // Thống kê theo từng chủ đề
        categoryStats: {
            type: Map,
            of: {
                total: { type: Number, default: 0 },
                correct: { type: Number, default: 0 },
            },
            default: {},
        },
        // Danh sách huy hiệu đã đạt
        badges: [
            {
                id: { type: String, required: true },
                title: { type: String, required: true },
                description: { type: String, default: '' },
                category: { type: String, default: 'general' },
                icon: { type: String, default: 'Award' },
                earnedAt: { type: Date, default: Date.now },
            },
        ],
        // Thử thách hàng ngày (Daily Challenge)
        dailyChallenge: {
            lastCompletedDate: { type: String, default: null }, // YYYY-MM-DD
            streak: { type: Number, default: 0 },
        },
        // Lịch sử các lần chơi gần nhất (giới hạn 20 lần)
        history: [
            {
                score: { type: Number, required: true },
                totalQuestions: { type: Number, required: true },
                correctCount: { type: Number, required: true },
                category: { type: String, default: 'all' },
                mode: { type: String, default: 'standard' }, // standard | personalized | daily
                badgeTitle: { type: String, default: '' },
                completedAt: { type: Date, default: Date.now },
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('QuizProgress', quizProgressSchema);
