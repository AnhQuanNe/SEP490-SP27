const mongoose = require('mongoose');

const hotspotSchema = new mongoose.Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    tag: { type: String },
    x: { type: Number, required: true }, // Tỉ lệ % trên ảnh (0 - 100)
    y: { type: Number, required: true },
    detail: { type: String, required: true },
    audioScript: { type: String, default: '' } // Lời đọc thuyết minh biên soạn riêng cho điểm ghim này
}, { _id: false });

const angleSchema = new mongoose.Schema({
    deg: { type: Number, required: true }, // 0, 45, 90...
    label: { type: String, required: true },
    image: { type: String, required: true }, // Cloudinary URL
    hotspots: [hotspotSchema]
}, { _id: false });

const artifactSchema = new mongoose.Schema({
    slug: { 
        type: String, 
        required: true, 
        unique: true, 
        index: true 
    },
    name: { 
        type: String, 
        required: true 
    },
    subtitle: { 
        type: String, 
        required: true 
    },
    textbookUnit: { 
        type: String, 
        required: true 
    },
    era: { 
        type: String, 
        required: true 
    },
    location: { 
        type: String, 
        required: true 
    },
    textbookExcerpt: { 
        type: String, 
        required: true 
    },
    textbookSource: { 
        type: String, 
        required: true 
    },
    angles: [angleSchema],
    fourLayers: {
        literal: { type: String, required: true },
        symbolic: { type: String, required: true },
        philosophical: { type: String, required: true },
        folkQuotes: [{ type: String }]
    },
    academicSource: { 
        type: String, 
        required: true 
    },
    audioNarrationScript: { 
        type: String, 
        default: '' // Lời dẫn thuyết minh tùy chỉnh do Admin/Chuyên gia văn hóa biên soạn
    },
    cloudinaryModelUrl: { 
        type: String, 
        default: '' 
    },
    order: { 
        type: Number, 
        default: 0 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Artifact', artifactSchema);
