const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Vui lòng nhập tiêu đề bài học'],
            trim: true,
        },
        signConcept: {
            type: String,
            required: [true, 'Vui lòng nhập khái niệm cử chỉ (từ vựng)'],
            trim: true,
        },
        pinyinOrEn: {
            type: String,
            default: '',
            trim: true,
        },
        category: {
            type: String,
            required: true,
            trim: true,
        },
        stage: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        order: {
            type: Number,
            required: true,
            default: 1,
        },
        description: {
            type: String,
            required: true,
        },
        instructions: {
            type: [String],
            default: [],
        },
        tips: {
            type: String,
            default: 'Giữ thế tay ổn định trong 1.5 giây để đạt chuẩn AI.',
        },
        region: {
            type: String,
            default: 'Toàn quốc (Phổ thông)',
        },
        standardVideoUrl: {
            type: String,
            default: '',
        },
        thumbnailUrl: {
            type: String,
            default: '',
        },
        xpReward: {
            type: Number,
            default: 50,
        },
        difficulty: {
            type: String,
            enum: ['Cơ bản', 'Trung bình', 'Nâng cao'],
            default: 'Cơ bản',
        },
        targetHandAngle: {
            type: Number,
            default: 165, // Góc chuẩn mẫu của ngón tay
        },
        holdTimeRequired: {
            type: Number,
            default: 1.5, // Giây
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index sắp xếp theo chặng và thứ tự
lessonSchema.index({ stage: 1, order: 1 });

module.exports = mongoose.model('Lesson', lessonSchema);
