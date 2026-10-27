const mongoose = require('mongoose');

const poemSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        authorName: {
            type: String,
            default: 'Vô danh thi sĩ',
            trim: true,
        },
        title: {
            type: String,
            required: [true, 'Vui lòng nhập tựa đề bài thơ'],
            trim: true,
            maxlength: [150, 'Tựa đề không được vượt quá 150 ký tự'],
        },
        content: {
            type: String,
            required: [true, 'Vui lòng nhập nội dung bài thơ'],
        },
        status: {
            type: String,
            enum: ['draft', 'published', 'private'],
            default: 'draft',
            index: true,
        },
        scores: {
            toneScore: { type: Number, default: 0, min: 0, max: 40 },
            rhythmScore: { type: Number, default: 0, min: 0, max: 30 },
            poeticScore: { type: Number, default: 0, min: 0, max: 30 },
            totalScore: { type: Number, default: 0, min: 0, max: 100 },
        },
        analysisResult: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Poem', poemSchema);
