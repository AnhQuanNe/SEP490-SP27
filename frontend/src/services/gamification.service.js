import api from './api';

export const gamificationService = {
    /**
     * Lấy thông tin thành tích, EXP, danh hiệu khoa bảng và streak
     */
    async getMyStats() {
        const response = await api.get('/gamification/stats');
        return response.data;
    },

    /**
     * Lấy Bảng Vàng Trạng Nguyên
     */
    async getLeaderboard({ type = 'all', limit = 10 } = {}) {
        const response = await api.get(`/gamification/leaderboard?type=${type}&limit=${limit}`);
        return response.data || [];
    },

    /**
     * Ghi nhận hoạt động học tập để nhận EXP
     */
    async trackActivity({ actionType, targetId, description }) {
        const response = await api.post('/gamification/track-activity', {
            actionType,
            targetId,
            description,
        });
        return response.data;
    },

    /**
     * Tham gia ghép cặp Thi Đình 1v1
     */
    async matchmakeDuel() {
        const response = await api.post('/gamification/duel/matchmake');
        return response.data;
    },

    /**
     * Ghép cặp trực tiếp với Trạng Nguyên AI (Bot)
     */
    async matchmakeBotDuel() {
        const response = await api.post('/gamification/duel/match-bot');
        return response.data;
    },

    /**
     * Rời hàng đợi Thi Đình
     */
    async leaveDuelQueue() {
        const response = await api.post('/gamification/duel/leave-queue');
        return response.data;
    },

    /**
     * Xem trạng thái phòng thi đấu
     */
    async getDuelStatus(matchId) {
        const response = await api.get(`/gamification/duel/${matchId}`);
        return response.data;
    },

    /**
     * Gửi đáp án hiệp đấu
     */
    async answerDuelRound({ matchId, questionIndex, selectedIndex, responseTimeMs }) {
        const response = await api.post(`/gamification/duel/${matchId}/answer`, {
            questionIndex,
            selectedIndex,
            responseTimeMs,
        });
        return response.data;
    },

    /**
     * Lịch sử thi đấu của người chơi
     */
    async getDuelHistory() {
        const response = await api.get('/gamification/duel/history');
        return response.data || [];
    },
};

export default gamificationService;
