const rawApiUrl = import.meta.env.VITE_API_URL;
const rawServerUrl = import.meta.env.VITE_SERVER_URL;

const trimmedApiUrl = typeof rawApiUrl === 'string' ? rawApiUrl.trim().replace(/\/+$/, '') : '';
const trimmedServerUrl = typeof rawServerUrl === 'string' ? rawServerUrl.trim().replace(/\/+$/, '') : '';

export const API_URL = trimmedApiUrl || 'http://localhost:5000/api';

// Khi chạy sau Nginx reverse proxy (VITE_API_URL=/api), SERVER_URL rỗng để dùng cùng origin.
// Nếu chỉ cấu hình VITE_API_URL dạng http(s)://..., tự suy ra SERVER_URL bằng cách bỏ /api.
export const SERVER_URL = trimmedServerUrl
    ? trimmedServerUrl
    : trimmedApiUrl.startsWith('/')
      ? ''
      : trimmedApiUrl.startsWith('http://') || trimmedApiUrl.startsWith('https://')
        ? trimmedApiUrl.replace(/\/api\/?$/i, '')
        : 'http://localhost:5000';

