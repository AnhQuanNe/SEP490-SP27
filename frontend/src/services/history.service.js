import api from './api';

export const historyService = {
    /**
     * Lấy lịch sử tìm kiếm của người dùng (UC13)
     */
    async getHistory(page = 1, limit = 50, searchType = '', sort = '') {
        let url = `/search-history?page=${page}&limit=${limit}`;
        if (searchType) url += `&searchType=${encodeURIComponent(searchType)}`;
        if (sort) url += `&sort=${encodeURIComponent(sort)}`;

        const response = await api.get(url);
        return {
            history: response.data || [],
            pagination: response.pagination || { total: 0, page: 1, limit, totalPages: 1 },
            stats: response.stats || {
                totalSearches: response.pagination?.total || 0,
                semanticSearches: 0,
                keywordSearches: 0,
            },
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
     * Xóa nhiều mục lịch sử tìm kiếm theo danh sách ID
     */
    async deleteMultiple(ids) {
        const response = await api.post('/search-history/bulk-delete', { ids });
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
