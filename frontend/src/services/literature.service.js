import api from './api';

export const literatureService = {
    /**
     * Lấy danh sách tác phẩm nổi bật từ MongoDB (UC06)
     */
    async getFeaturedWorks(limit = 6) {
        const response = await api.get(`/literature/featured?limit=${limit}`);
        return response.data || [];
    },

    /**
     * Lấy danh sách các thể loại văn học và số lượng thực tế
     */
    async getCategories() {
        const response = await api.get('/literature/categories');
        return response.data || [];
    },

    /**
     * Lấy danh sách từ khóa tìm kiếm phổ biến
     */
    async getPopularTags() {
        const response = await api.get('/literature/tags');
        return response.data || [];
    },

    /**
     * Tìm kiếm và lọc tác phẩm (UC06 Browse, UC07 Search Folk Literature)
     */
    async searchWorks({ query = '', category = 'all', region = '', page = 1, limit = 12 } = {}) {
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        if (category && category !== 'all') params.append('category', category);
        if (region) params.append('region', region);
        if (page) params.append('page', page);
        if (limit) params.append('limit', limit);

        const response = await api.get(`/literature/search?${params.toString()}`);
        return {
            works: response.works || [],
            pagination: response.pagination || { total: 0, page: 1, limit, totalPages: 1 },
        };
    },

    /**
     * Lấy chi tiết tác phẩm theo slug (UC08 View Content Details)
     */
    async getWorkBySlug(slug) {
        const response = await api.get(`/literature/${slug}`);
        return response.data;
    },
};

export default literatureService;
