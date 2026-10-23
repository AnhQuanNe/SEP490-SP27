const mongoose = require('mongoose');

const learningDaySchema = new mongoose.Schema(
    {
        day: {
            type: Number,
            required: true,
            min: 1,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        objective: {
            type: String,
            required: true,
            trim: true,
        },
        phase: {
            type: String,
            enum: ['basic', 'intermediate', 'advanced', 'synthesis'],
            default: 'basic',
        },
        workIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Work',
            },
        ],
        works: [
            {
                workId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Work',
                },
                title: { type: String, required: true },
                slug: { type: String, required: true },
                category: { type: String, default: 'ca-dao' },
                categoryName: { type: String, default: '' },
                quote: { type: String, default: '' },
                summary: { type: String, default: '' },
                literalMeaning: { type: String, default: '' },
                figurativeMeaning: { type: String, default: '' },
                lesson: { type: String, default: '' },
                historicalContext: { type: String, default: '' },
                thematicMeaning: { type: String, default: '' },
                source: { type: String, default: '' },
            },
        ],
        aiAnalysis: {
            type: String,
            default: '',
        },
        activity: {
            type: String,
            default: '',
        },
        practiceQuestions: [
            {
                questionId: { type: String, default: '' },
                question: { type: String, required: true },
                options: {
                    type: [String],
                    validate: {
                        validator: (opts) => Array.isArray(opts) && opts.length >= 2,
                        message: 'Câu hỏi phải có ít nhất 2 phương án',
                    },
                },
                correctIndex: { type: Number, required: true, min: 0, max: 3 },
                explanation: { type: String, default: '' },
                culturalContext: { type: String, default: '' },
                workId: { type: mongoose.Schema.Types.ObjectId, ref: 'Work', default: null },
                workTitle: { type: String, default: '' },
            },
        ],
        estimatedMinutes: {
            type: Number,
            default: 10,
        },
        isCompleted: {
            type: Boolean,
            default: false,
        },
        completedAt: {
            type: Date,
            default: null,
        },
        quizScore: {
            type: Number,
            default: null,
        },
        quizDetails: [
            {
                question: String,
                selectedIndex: Number,
                correctIndex: Number,
                isCorrect: Boolean,
                explanation: String,
            },
        ],
        userNotes: {
            type: String,
            default: '',
            trim: true,
        },
    },
    { _id: true }
);

const learningPathSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Lộ trình phải thuộc về một người dùng xác định'],
            index: true,
        },
        title: {
            type: String,
            required: [true, 'Vui lòng cung cấp tiêu đề lộ trình'],
            trim: true,
        },
        topic: {
            type: String,
            required: [true, 'Vui lòng chọn chủ đề học tập'],
            trim: true,
            index: true,
        },
        topicLabel: {
            type: String,
            default: '',
            trim: true,
        },
        goal: {
            type: String,
            required: [true, 'Vui lòng nhập mục tiêu học tập'],
            trim: true,
        },
        totalDays: {
            type: Number,
            required: [true, 'Vui lòng chọn số ngày học'],
            min: [1, 'Lộ trình tối thiểu 1 ngày'],
            max: [30, 'Lộ trình tối đa 30 ngày'],
        },
        dailyMinutes: {
            type: Number,
            required: [true, 'Vui lòng chọn thời gian học mỗi ngày'],
            min: [5, 'Thời gian học tối thiểu 5 phút'],
            max: [60, 'Thời gian học tối đa 60 phút'],
            default: 15,
        },
        status: {
            type: String,
            enum: ['in_progress', 'completed', 'archived'],
            default: 'in_progress',
            index: true,
        },
        days: [learningDaySchema],
        progress: {
            completedDays: {
                type: Number,
                default: 0,
            },
            percent: {
                type: Number,
                default: 0,
            },
            currentDay: {
                type: Number,
                default: 1,
            },
            lastLearnedAt: {
                type: Date,
                default: Date.now,
            },
        },
        recommendations: [
            {
                type: {
                    type: String,
                    enum: ['review', 'advance', 'continue', 'encouragement'],
                    default: 'continue',
                },
                message: { type: String, required: true },
                relatedWorkTitle: { type: String, default: '' },
                relatedWorkSlug: { type: String, default: '' },
                suggestedDay: { type: Number, default: null },
                createdAt: { type: Date, default: Date.now },
            },
        ],
    },
    {
        timestamps: true,
    }
);

learningPathSchema.index({ user: 1, status: 1, updatedAt: -1 });

module.exports = mongoose.model('LearningPath', learningPathSchema);
