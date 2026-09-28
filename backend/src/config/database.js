const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sep490');
        console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
    } catch (error) {
        console.error(`[MongoDB] Connection error: ${error.message}`);
        // Không exit ngay để server vẫn khởi động và báo lỗi rõ ràng nếu DB chưa bật
    }
};

module.exports = connectDB;
