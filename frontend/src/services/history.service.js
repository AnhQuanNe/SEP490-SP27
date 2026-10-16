import api from './api';

export const historyService = {
    /**
     * Lấy lịch sử tìm kiếm của người dùng (UC13)
     */
    async getHistory(page = 1, limit = 20) {
        const response = await api.get(`/search-history?page=${page}&limit=${limit}`);
        return {
            history: response.data || [],
            pagination: response.pagination || { total: 0, page: 1, limit, totalPages: 1 },
        };
    },

    /**
     * Xóa toàn bộ lịch sử tìm kiếm
     */
    async clearHistory() {
        const response = await api.delete('/search-history');
        return response;
    },

    /**
     * Xóa một mục lịch sử
     */
    async deleteItem(id) {
        const response = await api.delete(`/search-history/${id}`);
        return response;
    },
};

export default historyService;
