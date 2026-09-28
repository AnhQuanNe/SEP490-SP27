import api from './api';

export const authService = {
    // Đăng ký
    register: (data) => api.post('/auth/register', data),

    // Xác thực email với mã OTP
    verifyEmail: (data) => api.post('/auth/verify-email', data),

    // Gửi lại mã OTP
    resendVerification: (data) => api.post('/auth/resend-verification', data),

    // Đăng nhập email & mật khẩu
    login: (data) => api.post('/auth/login', data),

    // Đăng nhập Google
    googleLogin: (idToken) => api.post('/auth/google', { idToken }),

    // Quên mật khẩu
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),

    // Đặt lại mật khẩu mới
    resetPassword: (data) => api.post('/auth/reset-password', data),
};

export default authService;
