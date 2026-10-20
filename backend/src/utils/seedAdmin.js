require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const SystemSetting = require('../models/SystemSetting');

async function seedAdmin() {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/sep490';
        await mongoose.connect(mongoUri);

        // 1. Tạo hoặc cập nhật tài khoản Admin
        const adminEmail = 'admin@vietheritage.vn';
        let admin = await User.findOne({ email: adminEmail });

        if (!admin) {
            admin = new User({
                name: 'Quản trị viên Di sản',
                email: adminEmail,
                password: 'Admin@123456',
                role: 'admin',
                isVerified: true,
                status: 'active',
            });
            await admin.save();
            console.log('✓ Đã tạo mới tài khoản Admin:', adminEmail, '| Password: Admin@123456');
        } else {
            admin.role = 'admin';
            admin.isVerified = true;
            admin.status = 'active';
            admin.password = 'Admin@123456';
            await admin.save();
            console.log('✓ Đã đồng bộ quyền Admin cho:', adminEmail, '| Password: Admin@123456');
        }

        // 2. Tạo thiết lập hệ thống mặc định (UC19)
        const defaultSettings = [
            {
                key: 'allowUserSubmissions',
                value: true,
                description: 'Cho phép người dùng đăng ký đóng góp câu ca dao, tục ngữ mới',
                category: 'submissions',
            },
            {
                key: 'aiExplanationEnabled',
                value: true,
                description: 'Kích hoạt tính năng Trợ lý AI giải thích nội dung và trả lời câu hỏi',
                category: 'ai',
            },
            {
                key: 'semanticSearchEnabled',
                value: true,
                description: 'Cho phép tìm kiếm ý nghĩa bằng ngôn ngữ tự nhiên',
                category: 'search',
            },
            {
                key: 'maintenanceMode',
                value: false,
                description: 'Chế độ bảo trì toàn hệ thống',
                category: 'system',
            },
            {
                key: 'systemNotice',
                value: 'Chào mừng bạn đến với VietHeritage AI — Nền tảng khám phá Ca dao, Tục ngữ và Di sản Văn hóa Việt Nam!',
                description: 'Thông báo trên banner đầu trang',
                category: 'announcement',
            },
        ];

        for (const setting of defaultSettings) {
            await SystemSetting.findOneAndUpdate(
                { key: setting.key },
                {
                    key: setting.key,
                    value: setting.value,
                    description: setting.description,
                    category: setting.category,
                    updatedBy: admin._id,
                },
                { upsert: true, returnDocument: 'after' }
            );
        }
        console.log(`✓ Đã cấu hình ${defaultSettings.length} thiết lập hệ thống chuẩn UC19!`);

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi seed admin & settings:', error);
        process.exit(1);
    }
}

seedAdmin();
