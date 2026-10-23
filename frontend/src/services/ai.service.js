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

    /**
     * Lấy danh sách các chủ đề học tập cho Gia sư văn hóa AI
     */
    async getTutorTopics() {
        const response = await api.get('/ai/tutor/topics');
        return response.data || [];
    },

    /**
     * Tương tác hỏi đáp học tập với Gia sư văn hóa AI
     */
    async chatWithTutor({ message, topic = null, history = [], selectedWorkSlug = null }) {
        const response = await api.post('/ai/tutor', {
            message,
            topic,
            history,
            selectedWorkSlug,
        });
        return response.data;
    },
};

export default aiService;
