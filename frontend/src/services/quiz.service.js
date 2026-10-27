import api from './api';

export const quizService = {
    /**
     * Lấy danh sách câu hỏi đố vui trắc nghiệm
     * category có thể là: 'all', thể loại cụ thể, 'personalized', 'daily'
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
     * Nộp bài thi và nhận kết quả, danh hiệu & lưu tiến độ (nếu đã đăng nhập)
     */
    async submitQuiz({ answers, mode = 'standard', category = 'all' }) {
        const response = await api.post('/quiz/submit', { answers, mode, category });
        return response.data;
    },

    /**
     * Lấy tiến độ học tập, tỷ lệ đúng theo chủ đề và huy hiệu thành tích
     */
    async getProgress() {
        const response = await api.get('/quiz/progress');
        return response.data;
    },

    /**
     * Yêu cầu AI giải thích đa tầng về câu hỏi (ý nghĩa nhân văn, bối cảnh, nguồn)
     */
    async getAiExplanation({ questionId, selectedAnswer }) {
        const response = await api.post('/quiz/ai-explain', { questionId, selectedAnswer });
        return response.data;
    },
};

export default quizService;
