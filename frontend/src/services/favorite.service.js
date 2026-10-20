import api from './api';

export const favoriteService = {
    /**
     * Lấy danh sách các tác phẩm yêu thích của người dùng (UC12)
     */
    async getFavorites(page = 1, limit = 12) {
        const response = await api.get(`/favorites?page=${page}&limit=${limit}`);
        return {
            works: response.data || [],
            pagination: response.pagination || { total: 0, page: 1, limit, totalPages: 1 },
        };
    },

    /**
     * Lưu hoặc bỏ lưu tác phẩm yêu thích (UC12)
     */
    async toggleFavorite(workId) {
        const response = await api.post(`/favorites/${workId}`);
        return response;
    },

    /**
     * Kiểm tra trạng thái yêu thích của 1 tác phẩm
     */
    async checkFavorite(workId) {
        const response = await api.get(`/favorites/check/${workId}`);
        return response.isFavorited || false;
    },
};

export default favoriteService;
