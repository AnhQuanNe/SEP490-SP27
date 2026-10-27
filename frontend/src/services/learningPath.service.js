import api from './api';

const learningPathService = {
    /**
     * Lấy danh sách các chủ đề khả dụng dựa trên số lượng tác phẩm thật trong cơ sở dữ liệu
     */
    async getTopics() {
        return await api.get('/learning-paths/topics');
    },

    /**
     * Tạo lộ trình học văn hóa cá nhân hóa mới
     */
    async createPath(data) {
        return await api.post('/learning-paths', data);
    },

    /**
     * Lấy tất cả lộ trình của người dùng đã đăng nhập
     */
    async getUserPaths() {
        return await api.get('/learning-paths');
    },

    /**
     * Lấy lộ trình đang học gần nhất
     */
    async getActivePath() {
        return await api.get('/learning-paths/active');
    },

    /**
     * Lấy chi tiết một lộ trình và danh sách bài học
     */
    async getPathById(pathId) {
        return await api.get(`/learning-paths/${pathId}`);
    },

    /**
     * Đánh dấu hoàn thành một ngày học và lưu ghi chú
     */
    async completeDay(pathId, dayNumber, userNotes = '') {
        return await api.post(`/learning-paths/${pathId}/days/${dayNumber}/complete`, { userNotes });
    },

    /**
     * Nộp bài kiểm tra trắc nghiệm ngày học, nhận điểm số và đề xuất cá nhân hóa
     */
    async submitDayQuiz(pathId, dayNumber, answers) {
        return await api.post(`/learning-paths/${pathId}/days/${dayNumber}/quiz`, { answers });
    },

    /**
     * Xóa lộ trình học
     */
    async deletePath(pathId) {
        return await api.delete(`/learning-paths/${pathId}`);
    },
};

export default learningPathService;
