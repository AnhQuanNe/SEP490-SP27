import api from './api';

export const submissionService = {
    /**
     * Gửi đóng góp ca dao, tục ngữ mới (UC14)
     */
    async createSubmission(data) {
        const response = await api.post('/submissions', data);
        return response;
    },

    /**
     * Xem danh sách bài đóng góp của tôi (UC14)
     */
    async getMySubmissions(page = 1, limit = 10) {
        const response = await api.get(`/submissions/my?page=${page}&limit=${limit}`);
        return {
            submissions: response.data || [],
            pagination: response.pagination || { total: 0, page: 1, limit, totalPages: 1 },
        };
    },

    /**
     * Xem chi tiết một bài đóng góp của tôi
     */
    async getMySubmissionDetail(id) {
        const response = await api.get(`/submissions/my/${id}`);
        return response.data;
    },
};

export default submissionService;
