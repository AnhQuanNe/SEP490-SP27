const mongoose = require('mongoose');

const contentSubmissionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: [true, 'Vui lòng nhập câu ca dao hoặc tục ngữ'],
            trim: true,
        },
        category: {
            type: String,
            enum: ['ca-dao', 'tuc-ngu', 'than-thoai', 'truyen-thuyet', 'co-tich', 'khac'],
            default: 'ca-dao',
            required: true,
            index: true,
        },
        topic: {
            type: String,
            default: 'Đạo đức & Lối sống',
            trim: true,
        },
        summary: {
            type: String,
            default: '',
            trim: true,
        },
        meaning: {
            type: String,
            required: [true, 'Vui lòng giải thích ý nghĩa nội dung'],
            trim: true,
        },
        literalMeaning: {
            type: String,
            default: '',
            trim: true,
        },
        figurativeMeaning: {
            type: String,
            default: '',
            trim: true,
        },
        lesson: {
            type: String,
            default: '',
            trim: true,
        },
        historicalContext: {
            type: String,
            default: '',
            trim: true,
        },
        region: {
            type: String,
            default: 'Toàn quốc',
            trim: true,
        },
        source: {
            type: String,
            required: [true, 'Vui lòng cung cấp nguồn tham khảo kiểm chứng (sách, tài liệu, nhà xuất bản)'],
            trim: true,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
            index: true,
        },
        adminNote: {
            type: String,
            default: '',
            trim: true,
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        reviewedAt: {
            type: Date,
            default: null,
        },
        publishedWorkId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Work',
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

contentSubmissionSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('ContentSubmission', contentSubmissionSchema);
