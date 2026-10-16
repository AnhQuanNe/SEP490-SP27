import api from './api';

export const quizService = {
    /**
     * Lấy danh sách câu hỏi đố vui trắc nghiệm (UC10)
     */
    async getQuestions({ category = 'all', count = 5 } = {}) {
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (count) params.append('count', count);

        const response = await api.get(`/quiz/questions?${params.toString()}`);
        return response.data || [];
    },

    /**
     * Nộp bài thi và nhận kết quả, danh hiệu & giải thích
     */
    async submitQuiz({ answers }) {
        const response = await api.post('/quiz/submit', { answers });
        return response.data;
    },
};

export default quizService;
