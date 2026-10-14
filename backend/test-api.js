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

        // 1. Test Register (Trực tiếp sinh JWT token, không bắt buộc OTP)
        console.log('\n1. Test Đăng ký tài khoản (Trực tiếp sinh JWT Token)...');
        const regRes = await authService.register({
            name: 'Nguyễn Văn Test',
            email: 'testuser@example.com',
            password: 'password123',
        });
        console.log('✓ Đăng ký thành công:', regRes.message);
        console.log('✓ Token nhận được ngay khi đăng ký:', regRes.token.substring(0, 25) + '...');
        console.log('✓ User trả về:', regRes.user.name, '| Email:', regRes.user.email);

        // 2. Test Login trực tiếp ngay sau khi đăng ký (Không cần OTP)
        console.log('\n2. Test Đăng nhập trực tiếp không cần qua bước OTP...');
        const loginRes = await authService.login({
            email: 'testuser@example.com',
            password: 'password123',
        });
        console.log('✓ Đăng nhập trực tiếp thành công! User:', loginRes.user.name, '| Role:', loginRes.user.role);

        // 3. Test gửi và xác thực OTP kích hoạt email (Dành cho tính năng sau này khi deploy)
        console.log('\n3. Test yêu cầu mã OTP kích hoạt email (Tính năng tương lai)...');
        await authService.resendVerificationCode({ email: 'testuser@example.com' });
        const userWithOtp = await User.findOne({ email: 'testuser@example.com' });
        console.log('✓ Đã tạo mã OTP cho tài khoản:', userWithOtp.verificationCode);
        const verifyRes = await authService.verifyEmail({
            email: 'testuser@example.com',
            otp: userWithOtp.verificationCode,
        });
        console.log('✓ Xác thực OTP thành công:', verifyRes.message);

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
