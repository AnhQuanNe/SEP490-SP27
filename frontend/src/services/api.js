import axios from 'axios';
import { API_URL } from '../config/env';

const api = axios.create({
    baseURL: API_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Tự động gán token vào Header nếu đã đăng nhập
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Xử lý lỗi trả về chung
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
        }
        let friendlyMessage = error.response?.data?.message;
        if (!friendlyMessage) {
            if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
                friendlyMessage = 'Yêu cầu kết nối quá thời gian quy định (Timeout). Vui lòng thử lại sau.';
            } else if (error.message === 'Network Error' || !error.response) {
                friendlyMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng hoặc đảm bảo backend đang chạy.';
            } else {
                friendlyMessage = error.message || 'Đã có lỗi xảy ra. Vui lòng thử lại!';
            }
        }

        const customError = {
            message: friendlyMessage,
            status: error.response?.status,
            code: error.code || error.response?.data?.code || null,
            data: error.response?.data,
        };
        return Promise.reject(customError);
    }
);

export default api;
