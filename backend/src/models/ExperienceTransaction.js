const mongoose = require('mongoose');

const experienceTransactionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        actionType: {
            type: String,
            required: true,
            enum: [
                'READ_WORK',
                'AI_TUTOR_CHAT',
                'QUIZ_CORRECT',
                'POEM_REVIEWED',
                'SUBMISSION_APPROVED',
                'DUEL_VICTORY',
                'DUEL_PARTICIPATE',
                'DAILY_STREAK',
            ],
            index: true,
        },
        expEarned: {
            type: Number,
            required: true,
            min: 1,
        },
        targetId: {
            type: String,
            default: null,
            index: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

// Compound index để chặn cộng EXP trùng lặp cho các hành động 1 lần
experienceTransactionSchema.index({ userId: 1, actionType: 1, targetId: 1 });

module.exports = mongoose.model('ExperienceTransaction', experienceTransactionSchema);
