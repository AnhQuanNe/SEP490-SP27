const mongoose = require('mongoose');

const playerMatchSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
            default: '',
        },
        score: {
            type: Number,
            default: 0,
        },
        isBot: {
            type: Boolean,
            default: false,
        },
        answers: [
            {
                questionIndex: Number,
                selectedIndex: Number,
                isCorrect: Boolean,
                responseTimeMs: Number,
                points: Number,
            },
        ],
    },
    { _id: false }
);

const duelMatchSchema = new mongoose.Schema(
    {
        matchId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        roomCode: {
            type: String,
            default: null,
            index: true,
        },
        isPrivate: {
            type: Boolean,
            default: false,
        },
        player1: {
            type: playerMatchSchema,
            required: true,
        },
        player2: {
            type: playerMatchSchema,
            default: null,
        },
        questions: [
            {
                id: String,
                question: String,
                options: [String],
                correctIndex: Number,
                explanation: String,
                categoryName: String,
            },
        ],
        status: {
            type: String,
            enum: ['WAITING', 'MATCHED', 'COUNTDOWN', 'IN_PROGRESS', 'ROUND_COMPLETED', 'FINISHED', 'CANCELLED'],
            default: 'WAITING',
            index: true,
        },
        currentQuestionIndex: {
            type: Number,
            default: 0,
        },
        roundStartTime: {
            type: Date,
            default: null,
        },
        winnerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        isTie: {
            type: Boolean,
            default: false,
        },
        endedAt: {
            type: Date,
            default: null,
        },
        isBotMatch: {
            type: Boolean,
            default: false,
        },
        botDifficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium',
        },
        questionCount: {
            type: Number,
            enum: [5, 10, 15],
            default: 5,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('DuelMatch', duelMatchSchema);
