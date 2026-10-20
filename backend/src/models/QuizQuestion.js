const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema(
    {
        questionId: {
            type: String,
            required: [true, 'Vui lòng cung cấp mã định danh câu hỏi'],
            unique: true,
            trim: true,
            index: true,
        },
        category: {
            type: String,
            required: [true, 'Vui lòng chọn thể loại câu hỏi'],
            enum: ['co-tich', 'truyen-thuyet', 'than-thoai', 'ca-dao', 'trung-dai', 'hien-dai', 'khac'],
            index: true,
        },
        categoryName: {
            type: String,
            required: [true, 'Vui lòng cung cấp tên hiển thị của thể loại'],
            trim: true,
        },
        difficulty: {
            type: String,
            enum: ['de', 'trung-binh', 'kho'],
            default: 'de',
            index: true,
        },
        relatedWorkSlug: {
            type: String,
            default: null,
            trim: true,
            index: true,
        },
        relatedWork: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Work',
            default: null,
            index: true,
        },
        question: {
            type: String,
            required: [true, 'Vui lòng nhập nội dung câu hỏi'],
            trim: true,
        },
        options: {
            type: [String],
            required: [true, 'Vui lòng cung cấp 4 phương án trả lời'],
            validate: {
                validator: function (opts) {
                    return Array.isArray(opts) && opts.length >= 2;
                },
                message: 'Câu hỏi trắc nghiệm phải có ít nhất 2 phương án',
            },
        },
        correctIndex: {
            type: Number,
            required: [true, 'Vui lòng chọn chỉ số đáp án đúng'],
            min: 0,
            max: 3,
        },
        explanation: {
            type: String,
            required: [true, 'Vui lòng nhập lời giải thích đáp án'],
            trim: true,
        },
        culturalContext: {
            type: String,
            default: '',
            trim: true,
        },
        academicSource: {
            type: String,
            default: '',
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index kết hợp tối ưu cho truy vấn ngẫu nhiên theo thể loại
quizQuestionSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('QuizQuestion', quizQuestionSchema);
