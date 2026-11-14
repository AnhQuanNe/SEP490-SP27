const fs = require('fs');
const mongoose = require('mongoose');

/**
 * Khi backend chạy trong Docker container mà .env vẫn dùng localhost/127.0.0.1,
 * tự động chuyển sang host.docker.internal để kết nối được MongoDB trên máy host.
 */
const resolveMongoUri = (rawUri) => {
    const uri = rawUri || 'mongodb://localhost:27017/sep490';
    if (!fs.existsSync('/.dockerenv')) return uri;

    try {
        const parsed = new URL(uri);
        if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
            parsed.hostname = process.env.DOCKER_HOST_ALIAS || 'host.docker.internal';
            console.log(`[MongoDB] Container detected -> using ${parsed.hostname} instead of localhost`);
            return parsed.toString();
        }
    } catch {
        // Giữ nguyên nếu là chuỗi URI nhiều host hoặc định dạng đặc biệt
    }
    return uri;
};

const connectDB = async () => {
    try {
        const mongoUri = resolveMongoUri(process.env.MONGO_URI);
        const conn = await mongoose.connect(mongoUri);
        console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);

        // Tự động kiểm tra & nạp ngân hàng đề thi mẫu nếu chưa có trong Database
        const seedQuizQuestions = require('../seeds/seedQuizQuestions');
        seedQuizQuestions().catch((seedErr) => {
            console.warn('[AutoSeed Quiz] Lưu ý nạp dữ liệu câu hỏi:', seedErr.message);
        });
    } catch (error) {
        console.error(`[MongoDB] Connection error: ${error.message}`);
        // Không exit ngay để server vẫn khởi động và báo lỗi rõ ràng nếu DB chưa bật
    }
};

module.exports = connectDB;
