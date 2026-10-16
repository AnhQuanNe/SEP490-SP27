import api from './api';

export const aiService = {
    /**
     * Gửi câu hỏi tới Trợ lý AI Di sản (RAG & Dẫn nguồn kiểm chứng)
     */
    async ask({ question, contextSlug = null, history = [] }) {
        const response = await api.post('/ai/ask', {
            question,
            contextSlug,
            history,
        });
        return response.data;
    },

    /**
     * Lấy danh sách câu hỏi gợi ý khám phá nhanh
     */
    async getSuggestions() {
        const response = await api.get('/ai/suggestions');
        return response.data || [];
    },
};

export default aiService;
