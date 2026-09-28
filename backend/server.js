require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/database');

const PORT = process.env.PORT || 5000;

// Kết nối MongoDB
connectDB();

// Khởi chạy server
const server = app.listen(PORT, () => {
    console.log(`\n🚀 Server đang chạy tại: http://localhost:${PORT}`);
    console.log(`📡 Môi trường: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API Health: http://localhost:${PORT}/api/health\n`);
});

// Bắt lỗi không xác định
process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
});

process.on('uncaughtException', (err) => {
    console.error(`Uncaught Exception: ${err.message}`);
});
