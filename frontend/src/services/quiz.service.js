import api from './api';

export const quizService = {
    /**
     * Lấy danh sách câu hỏi đố vui trắc nghiệm (UC10)
     */
    async getQuestions({ category = 'all', count = 5, difficulty = 'all' } = {}) {
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (count) params.append('count', count);
        if (difficulty && difficulty !== 'all') params.append('difficulty', difficulty);

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
