const nodemailer = require('nodemailer');

// Khởi tạo transporter nếu có cấu hình
const createTransporter = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        return null;
    }

    const cleanUser = process.env.EMAIL_USER.trim();
    const cleanPass = process.env.EMAIL_PASS.replace(/\s+/g, '').trim();

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: cleanUser,
            pass: cleanPass,
        },
    });
};

/**
 * Gửi email mã xác thực đăng ký (OTP)
 */
const sendVerificationEmail = async (toEmail, otp) => {
    const transporter = createTransporter();

    // In ra console để tiện dev/test ngay cả khi chưa có App Password Gmail
    console.log('\n========================================');
    console.log(`[EMAIL TEST DEV] Gửi mã xác thực đăng ký`);
    console.log(`Đến: ${toEmail}`);
    console.log(`MÃ OTP: ${otp} (Hiệu lực: 10 phút)`);
    console.log('========================================\n');

    if (!transporter) {
        return { success: true, mode: 'console' };
    }

    const mailOptions = {
        from: `"SEP490 Platform" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Xác thực tài khoản của bạn - SEP490',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #2563eb; text-align: center;">Xác Thực Tài Khoản</h2>
                <p>Xin chào,</p>
                <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng nhập mã OTP bên dưới để xác thực địa chỉ email của bạn:</p>
                <div style="text-align: center; margin: 24px 0;">
                    <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1e40af; background: #eff6ff; padding: 10px 24px; border-radius: 6px; border: 1px dashed #3b82f6;">
                        ${otp}
                    </span>
                </div>
                <p style="color: #64748b; font-size: 14px;">Mã xác thực có hiệu lực trong <b>10 phút</b>. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="color: #94a3b8; font-size: 12px; text-align: center;">SEP490 Support Team</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true, mode: 'smtp' };
    } catch (error) {
        console.error(`[Email Error] Không thể gửi mail: ${error.message}`);
        return { success: false, error: error.message };
    }
};

/**
 * Gửi email đặt lại mật khẩu
 */
const sendResetPasswordEmail = async (toEmail, resetToken) => {
    const transporter = createTransporter();
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}&email=${encodeURIComponent(toEmail)}`;

    console.log('\n========================================');
    console.log(`[EMAIL TEST DEV] Yêu cầu đặt lại mật khẩu`);
    console.log(`Đến: ${toEmail}`);
    console.log(`Token reset: ${resetToken}`);
    console.log(`Link reset: ${resetUrl}`);
    console.log('========================================\n');

    if (!transporter) {
        return { success: true, mode: 'console' };
    }

    const mailOptions = {
        from: `"SEP490 Platform" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Đặt lại mật khẩu - SEP490',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #dc2626; text-align: center;">Yêu Cầu Đặt Lại Mật Khẩu</h2>
                <p>Xin chào,</p>
                <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng bấm vào nút bên dưới để tạo mật khẩu mới:</p>
                <div style="text-align: center; margin: 24px 0;">
                    <a href="${resetUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                        Đặt Lại Mật Khẩu
                    </a>
                </div>
                <p style="color: #64748b; font-size: 13px;">Hoặc bạn có thể copy trực tiếp đường link sau dán vào trình duyệt:</p>
                <p style="word-break: break-all; color: #2563eb; font-size: 13px;">${resetUrl}</p>
                <p style="color: #64748b; font-size: 14px;">Liên kết này có hiệu lực trong <b>15 phút</b>.</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="color: #94a3b8; font-size: 12px; text-align: center;">SEP490 Support Team</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true, mode: 'smtp' };
    } catch (error) {
        console.error(`[Email Error] Không thể gửi mail: ${error.message}`);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendVerificationEmail,
    sendResetPasswordEmail,
};
