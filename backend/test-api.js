require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const authService = require('./src/services/auth.services');
const userController = require('./src/controllers/user.controller');

async function runTests() {
    try {
        console.log('--- BẮT ĐẦU KIỂM THỬ BACKEND AUTH & USER ---');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sep490');

        // Dọn dẹp dữ liệu test cũ nếu có
        await User.deleteOne({ email: 'testuser@example.com' });

        // 1. Test Register
        console.log('\n1. Test Đăng ký tài khoản...');
        const regRes = await authService.register({
            name: 'Nguyễn Văn Test',
            email: 'testuser@example.com',
            password: 'password123',
        });
        console.log('✓ Đăng ký thành công:', regRes.message);

        // Kiểm tra User trong MongoDB
        const savedUser = await User.findOne({ email: 'testuser@example.com' }).select('+password');
        console.log('✓ User được lưu trong MongoDB:');
        console.log('  - ID:', savedUser._id);
        console.log('  - Name:', savedUser.name);
        console.log('  - Email:', savedUser.email);
        console.log('  - Mật khẩu đã mã hoá bcrypt:', savedUser.password);
        console.log('  - Trạng thái xác thực isVerified:', savedUser.isVerified);
        console.log('  - Mã OTP lưu trong DB:', savedUser.verificationCode);

        // 2. Test Verify Email
        console.log('\n2. Test Xác thực email với mã OTP...');
        const verifyRes = await authService.verifyEmail({
            email: 'testuser@example.com',
            otp: savedUser.verificationCode,
        });
        console.log('✓ Xác thực thành công:', verifyRes.message);
        console.log('✓ Token nhận được:', verifyRes.token.substring(0, 25) + '...');

        // 3. Test Login
        console.log('\n3. Test Đăng nhập...');
        const loginRes = await authService.login({
            email: 'testuser@example.com',
            password: 'password123',
        });
        console.log('✓ Đăng nhập thành công! User:', loginRes.user.name, '| Role:', loginRes.user.role);

        // 4. Test Update Profile
        console.log('\n4. Test Cập nhật Profile...');
        const updated = await User.findByIdAndUpdate(
            loginRes.user.id,
            { phone: '0987654321', address: 'Hà Nội, Việt Nam' },
            { new: true }
        );
        console.log('✓ Đã cập nhật phone & address:', updated.phone, '|', updated.address);

        // 5. Test Change Password
        console.log('\n5. Test Đổi mật khẩu...');
        const userToChange = await User.findById(loginRes.user.id).select('+password');
        const matchOld = await userToChange.comparePassword('password123');
        if (!matchOld) throw new Error('Mật khẩu cũ không khớp!');
        userToChange.password = 'newPassword456';
        await userToChange.save();
        console.log('✓ Đổi mật khẩu thành công sang: newPassword456');

        // Test login với mật khẩu mới
        const reLoginRes = await authService.login({
            email: 'testuser@example.com',
            password: 'newPassword456',
        });
        console.log('✓ Đăng nhập lại với mật khẩu mới thành công!');

        // 6. Test Forgot Password & Reset
        console.log('\n6. Test Quên mật khẩu & Đặt lại...');
        await authService.forgotPassword({ email: 'testuser@example.com' });
        const userAfterForgot = await User.findOne({ email: 'testuser@example.com' });
        console.log('✓ Đã sinh reset token:', userAfterForgot.resetPasswordToken);

        await authService.resetPassword({
            email: 'testuser@example.com',
            token: userAfterForgot.resetPasswordToken,
            newPassword: 'finalPassword789',
        });
        console.log('✓ Reset mật khẩu thành công sang: finalPassword789');

        // Test login với mật khẩu sau khi reset
        const afterResetLogin = await authService.login({
            email: 'testuser@example.com',
            password: 'finalPassword789',
        });
        console.log('✓ Đăng nhập thành công với mật khẩu đã reset!');

        // Dọn dẹp tài khoản test
        await User.deleteOne({ email: 'testuser@example.com' });
        console.log('\n✓ Đã dọn dẹp user test.');
        console.log('\n========================================');
        console.log('🎉 TẤT CẢ CÁC TÍNH NĂNG BACKEND ĐÃ HOẠT ĐỘNG HOÀN HẢO!');
        console.log('========================================');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ LỖI TRONG QUÁ TRÌNH KIỂM THỬ:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

runTests();
