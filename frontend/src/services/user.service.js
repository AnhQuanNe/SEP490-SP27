import api from './api';

export const userService = {
    // Xem profile
    getProfile: () => api.get('/users/profile'),

    // Cập nhật profile (name, phone, address)
    updateProfile: (data) => api.put('/users/profile', data),

    // Đổi mật khẩu
    changePassword: (data) => api.put('/users/change-password', data),

    // Upload avatar
    uploadAvatar: (formData) =>
        api.post('/users/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
};

export default userService;
