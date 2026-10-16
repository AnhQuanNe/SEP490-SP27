import api from './api';

export const adminService = {
    // ==========================================
    // UC15: USER MANAGEMENT
    // ==========================================
    async getUsers({ page = 1, limit = 15, search = '', role = 'all', status = 'all' } = {}) {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', limit);
        if (search) params.append('search', search);
        if (role !== 'all') params.append('role', role);
        if (status !== 'all') params.append('status', status);

        const response = await api.get(`/admin/users?${params.toString()}`);
        return {
            users: response.data || [],
            pagination: response.pagination || { total: 0, page: 1, limit, totalPages: 1 },
        };
    },

    async updateUserStatus(id, status) {
        const response = await api.patch(`/admin/users/${id}/status`, { status });
        return response;
    },

    async updateUserRole(id, role) {
        const response = await api.patch(`/admin/users/${id}/role`, { role });
        return response;
    },

    // ==========================================
    // UC16 & UC17: REVIEW SUBMISSIONS
    // ==========================================
    async getSubmissions({ page = 1, limit = 15, status = 'all', category = 'all' } = {}) {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', limit);
        if (status !== 'all') params.append('status', status);
        if (category !== 'all') params.append('category', category);

        const response = await api.get(`/admin/submissions?${params.toString()}`);
        return {
            submissions: response.data || [],
            pagination: response.pagination || { total: 0, page: 1, limit, totalPages: 1 },
        };
    },

    async approveSubmission(id, adminNote = '') {
        const response = await api.post(`/admin/submissions/${id}/approve`, { adminNote });
        return response;
    },

    async rejectSubmission(id, adminNote = '') {
        const response = await api.post(`/admin/submissions/${id}/reject`, { adminNote });
        return response;
    },

    // ==========================================
    // UC18: PUBLISHED CONTENT MANAGEMENT
    // ==========================================
    async getWorks({ page = 1, limit = 15, search = '', category = 'all', status = 'all' } = {}) {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', limit);
        if (search) params.append('search', search);
        if (category !== 'all') params.append('category', category);
        if (status !== 'all') params.append('status', status);

        const response = await api.get(`/admin/works?${params.toString()}`);
        return {
            works: response.data || [],
            pagination: response.pagination || { total: 0, page: 1, limit, totalPages: 1 },
        };
    },

    async createWork(data) {
        const response = await api.post('/admin/works', data);
        return response;
    },

    async updateWork(id, data) {
        const response = await api.put(`/admin/works/${id}`, data);
        return response;
    },

    async deleteWork(id) {
        const response = await api.delete(`/admin/works/${id}`);
        return response;
    },

    // ==========================================
    // UC19: SYSTEM SETTINGS
    // ==========================================
    async getSettings() {
        const response = await api.get('/admin/settings');
        return response.data || [];
    },

    async updateSetting(key, value) {
        const response = await api.put('/admin/settings', { key, value });
        return response;
    },

    async getPublicSettings() {
        const response = await api.get('/settings/public');
        return response.data || {};
    },
};

export default adminService;
