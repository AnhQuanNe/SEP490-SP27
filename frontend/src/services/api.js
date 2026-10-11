import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
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
        const customError = {
            message:
                error.response?.data?.message ||
                error.message ||
                'Đã có lỗi xảy ra. Vui lòng thử lại!',
            status: error.response?.status,
            data: error.response?.data,
        };
        return Promise.reject(customError);
    }
);

export default api;
