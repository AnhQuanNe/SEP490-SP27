const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Vui lòng nhập tên địa phương / địa danh văn hóa'],
            trim: true,
            index: true,
        },
        slug: {
            type: String,
            required: [true, 'Vui lòng cung cấp slug định danh cho địa phương'],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        region: {
            type: String,
            enum: ['Bắc', 'Trung', 'Nam', 'Toàn quốc'],
            default: 'Bắc',
            index: true,
        },
        coordinates: {
            lat: {
                type: Number,
                required: [true, 'Vui lòng cung cấp vĩ độ (latitude)'],
                min: [-90, 'Vĩ độ không thể nhỏ hơn -90'],
                max: [90, 'Vĩ độ không thể lớn hơn 90'],
            },
            lng: {
                type: Number,
                required: [true, 'Vui lòng cung cấp kinh độ (longitude)'],
                min: [-180, 'Kinh độ không thể nhỏ hơn -180'],
                max: [180, 'Kinh độ không thể lớn hơn 180'],
            },
        },
        description: {
            type: String,
            default: '',
            trim: true,
        },
        historicalContext: {
            type: String,
            default: '',
            trim: true,
        },
        image: {
            type: String,
            default: '',
            trim: true,
        },
        sources: {
            type: String,
            default: '',
            trim: true,
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

locationSchema.index({ 'coordinates.lat': 1, 'coordinates.lng': 1 });

module.exports = mongoose.model('Location', locationSchema);
