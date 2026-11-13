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

// Middleware kiểm tra chế độ bảo trì toàn hệ thống (UC19)
const SystemSetting = require('./models/SystemSetting');
app.use(async (req, res, next) => {
    // Không chặn các request quản trị, xác thực, health check và public settings
    if (
        req.path.startsWith('/api/admin') ||
        req.path.startsWith('/api/auth') ||
        req.path === '/api/health' ||
        req.path === '/api/settings/public' ||
        req.path.startsWith('/uploads')
    ) {
        return next();
    }

    try {
        const maintenance = await SystemSetting.findOne({ key: 'maintenanceMode' }).lean();
        if (maintenance && maintenance.value === true) {
            // Cho phép Admin truy cập mọi route để kiểm thử trong thời gian bảo trì
            if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
                const token = req.headers.authorization.split(' ')[1];
                try {
                    const jwt = require('jsonwebtoken');
                    const User = require('./models/User');
                    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sep490_super_secret_jwt_key_2026_sp27');
                    const user = await User.findById(decoded.id).select('role status').lean();
                    if (user && user.role === 'admin' && user.status !== 'locked') {
                        return next();
                    }
                } catch (authErr) {
                    // Token không hợp lệ thì tiếp tục chặn 503
                }
            }

            return res.status(503).json({
                success: false,
                code: 'MAINTENANCE_MODE',
                message: 'Hệ thống hiện đang tạm thời bảo trì để nâng cấp hạ tầng. Vui lòng quay lại sau ít phút.',
            });
        }
    } catch (err) {
        // Nếu lỗi kết nối DB tạm thời thì bỏ qua để không chặn người dùng
    }
    next();
});

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
