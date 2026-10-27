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
        return {
            ...(response.data || {}),
            quota: response.quota || null,
        };
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

    /**
     * Lấy thông tin số lượt AI còn lại trong ngày của Guest
     */
    async getQuota() {
        const response = await api.get('/ai/quota');
        return response;
    },

    /**
     * Trợ lý AI hỗ trợ người dùng phân tích 4 tầng nghĩa khi đóng góp câu ca dao, tục ngữ
     */
    async draftSubmission({ title, category = 'ca-dao' }) {
        const response = await api.post('/ai/draft-submission', {
            title,
            category,
        });
        return response.data;
    },

    /**
     * Smart Text Selection: Phân tích địa danh, bối cảnh lịch sử hoặc biện pháp tu từ cho đoạn trích bôi đen
     */
    async analyzeSnippet({ snippet, workSlug = null, workTitle = null, analysisType = 'general' }) {
        const response = await api.post('/ai/analyze-snippet', {
            snippet,
            workSlug,
            workTitle,
            analysisType,
        });
        return {
            ...(response.data || {}),
            quota: response.quota || null,
        };
    },
};


export default aiService;
