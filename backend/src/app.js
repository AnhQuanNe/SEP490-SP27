const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');

const app = express();

// Cấu hình CORS
const allowedOrigins = [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:3000',
];

app.use(
    cors({
        origin: function (origin, callback) {
            // Cho phép các request không có origin (ví dụ: Postman, Mobile app) hoặc nằm trong danh sách whitelist
            if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
                callback(null, true);
            } else {
                callback(null, true); // Trong môi trường dev/demo cho phép tất cả để tránh lỗi cors
            }
        },
        credentials: true,
    })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cung cấp file tĩnh (cho phép xem ảnh avatar đã upload)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api', routes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Backend is running smoothly' });
});

// Xử lý 404
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Đường dẫn ${req.originalUrl} không tồn tại trên hệ thống`,
    });
});

// Xử lý lỗi tập trung (Global Error Handler)
app.use((err, req, res, next) => {
    console.error('Lỗi hệ thống:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Đã có lỗi xảy ra trên server',
    });
});

module.exports = app;
