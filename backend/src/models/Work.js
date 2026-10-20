const mongoose = require('mongoose');

const workSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Vui lòng nhập tên tác phẩm/truyện'],
            trim: true,
            index: true,
        },
        slug: {
            type: String,
            required: [true, 'Vui lòng cung cấp slug định danh'],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        category: {
            type: String,
            required: [true, 'Vui lòng chọn mã phân loại'],
            enum: ['than-thoai', 'truyen-thuyet', 'co-tich', 'ca-dao', 'tuc-ngu', 'trung-dai', 'hien-dai', 'khac'],
            default: 'co-tich',
            index: true,
        },
        categoryName: {
            type: String,
            required: [true, 'Vui lòng cung cấp tên phân loại'],
            trim: true,
        },
        period: {
            type: String,
            default: 'Văn học Dân gian',
            trim: true,
        },
        region: {
            type: String,
            default: 'Toàn quốc',
            trim: true,
            index: true,
        },
        author: {
            type: String,
            default: 'Dân gian',
            trim: true,
        },
        summary: {
            type: String,
            required: [true, 'Vui lòng nhập tóm tắt tác phẩm'],
            trim: true,
        },
        quote: {
            type: String,
            default: '',
            trim: true,
        },
        content: {
            type: String,
            default: '',
        },
        historicalContext: {
            type: String,
            default: '',
            trim: true,
        },
        thematicMeaning: {
            type: String,
            default: '',
            trim: true,
        },
        topic: {
            type: String,
            default: 'Văn hóa & Đạo lý',
            trim: true,
            index: true,
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
        source: {
            type: String,
            required: [true, 'Vui lòng cung cấp nguồn tham khảo học thuật kiểm chứng'],
            trim: true,
        },
        tags: {
            type: [String],
            default: [],
            index: true,
        },
        readTime: {
            type: String,
            default: '5 phút đọc',
        },
        viewsCount: {
            type: Number,
            default: 0,
        },
        likesCount: {
            type: Number,
            default: 0,
        },
        isFeatured: {
            type: Boolean,
            default: false,
            index: true,
        },
        status: {
            type: String,
            enum: ['published', 'draft', 'archived'],
            default: 'published',
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Tạo text index phục vụ tìm kiếm toàn văn bản cho UC07 & UC09
workSchema.index({
    title: 'text',
    summary: 'text',
    quote: 'text',
    tags: 'text',
    author: 'text',
    region: 'text',
    topic: 'text',
    literalMeaning: 'text',
    figurativeMeaning: 'text',
    lesson: 'text',
    thematicMeaning: 'text',
});

module.exports = mongoose.model('Work', workSchema);
