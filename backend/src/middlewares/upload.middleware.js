const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Đảm bảo thư mục lưu trữ avatar luôn tồn tại
const uploadDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình lưu trữ
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `avatar-${req.user ? req.user._id : 'guest'}-${uniqueSuffix}${ext}`);
    },
});

// Bộ lọc định dạng file ảnh
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    }
    cb(new Error('Chỉ chấp nhận các file ảnh có định dạng JPG, PNG, WEBP, GIF!'));
};

const uploadAvatar = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
    fileFilter,
});

// =========================================================================
// Cấu hình tải file âm thanh (.mp3, .m4a, .wav) lưu vào RAM để đẩy Cloudinary
// =========================================================================
const audioStorage = multer.memoryStorage();

const audioFileFilter = (req, file, cb) => {
    const allowedExts = /\.(mp3|m4a|wav|aac|ogg|webm|flac)$/i;
    const isExtValid = allowedExts.test(path.extname(file.originalname).toLowerCase());
    const isMimeValid =
        file.mimetype.startsWith('audio/') ||
        file.mimetype === 'video/mp4' ||
        file.mimetype === 'application/octet-stream';

    if (isExtValid || isMimeValid) {
        return cb(null, true);
    }
    cb(new Error('Chỉ chấp nhận các file âm thanh định dạng MP3, M4A, WAV, AAC, OGG!'));
};

const uploadAudio = multer({
    storage: audioStorage,
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB cho tác phẩm văn học dài
    fileFilter: audioFileFilter,
});

module.exports = {
    uploadAvatar,
    uploadAudio,
};
