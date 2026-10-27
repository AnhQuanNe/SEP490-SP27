require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/database');

const http = require('http');
const { Server } = require('socket.io');
const { initDuelSocket } = require('./src/sockets/duelSocket');

const PORT = process.env.PORT || 5000;

// Kết nối MongoDB
connectDB();

// Khởi tạo HTTP Server & WebSocket
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

// Khởi chạy Socket namespace cho Đấu trường Thi Đình
initDuelSocket(io);

// Khởi chạy server
server.listen(PORT, () => {
    console.log(`\n🚀 Server đang chạy tại: http://localhost:${PORT}`);
    console.log(`📡 Môi trường: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⚡ WebSocket Đấu trường Thi Đình sẵn sàng: /duel`);
    console.log(`🔗 API Health: http://localhost:${PORT}/api/health\n`);
});

// Bắt lỗi không xác định
process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
});

process.on('uncaughtException', (err) => {
    console.error(`Uncaught Exception: ${err.message}`);
});
