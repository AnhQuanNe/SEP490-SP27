import api from './api';

const learningService = {
    // Lấy toàn bộ cây kỹ năng từ Backend
    getSkillTree: async () => {
        return await api.get('/learning/skill-tree');
    },

    // Lấy chi tiết một bài học kèm video mẫu
    getLessonById: async (id) => {
        return await api.get(`/learning/lessons/${id}`);
    },

    // Ghi nhận hoàn thành bài tập Gương ảo AI (Hold-time 1.5s validator)
    completeLesson: async (id, data = {}) => {
        return await api.post(`/learning/lessons/${id}/complete`, data);
    },

    // Lấy thống kê hồ sơ năng lực học tập
    getUserStats: async () => {
        return await api.get('/learning/stats');
    },
};

export default learningService;
