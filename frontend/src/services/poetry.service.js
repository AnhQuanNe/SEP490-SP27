import api from './api';

export const poetryService = {
    /**
     * Phân tích âm luật bài thơ Lục Bát theo Rule Engine
     */
    async analyzePoem(content) {
        const response = await api.post('/poetry/analyze', { content });
        return response.data;
    },

    /**
     * Thẩm định thơ toàn diện (Rule Engine + AI Critic)
     */
    async critiquePoem({ content, title, authorName }) {
        const response = await api.post('/poetry/critique', { content, title, authorName });
        return response.data;
    },

    /**
     * Ứng khẩu câu Bát cùng AI
     */
    async coWrite({ lucLine, context }) {
        const response = await api.post('/poetry/co-write', { lucLine, context });
        return response.data;
    },

    /**
     * Lưu bài thơ hoặc bản nháp
     */
    async savePoem({ poemId, title, content, authorName, status, analysisResult }) {
        const response = await api.post('/poetry/save', {
            poemId,
            title,
            content,
            authorName,
            status,
            analysisResult,
        });
        return response.data;
    },

    /**
     * Lấy danh sách thơ của tôi
     */
    async getMyPoems() {
        const response = await api.get('/poetry/user/my-poems');
        return response.data || [];
    },

    /**
     * Xem chi tiết bài thơ
     */
    async getPoemDetail(id) {
        const response = await api.get(`/poetry/${id}`);
        return response.data;
    },

    /**
     * Xóa bài thơ
     */
    async deletePoem(id) {
        const response = await api.delete(`/poetry/${id}`);
        return response.data;
    },

    /**
     * Lấy danh sách thơ cộng đồng
     */
    async getCommunityPoems({ page = 1, limit = 12 } = {}) {
        const response = await api.get(`/poetry/community?page=${page}&limit=${limit}`);
        return response.data;
    },
};

export default poetryService;
