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

    /**
     * Tìm kiếm theo ý nghĩa bằng ngôn ngữ tự nhiên (UC09 Semantic Search)
     */
    async semanticSearch({ query = '', page = 1, limit = 12 } = {}) {
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        if (page) params.append('page', page);
        if (limit) params.append('limit', limit);

        const response = await api.get(`/literature/semantic-search?${params.toString()}`);
        return {
            works: response.works || [],
            semanticConcept: response.semanticConcept,
            conceptDescription: response.conceptDescription,
            searchMethod: response.searchMethod || null,
            aiInsight: response.aiInsight || null,
            pagination: response.pagination || { total: 0, page: 1, limit, totalPages: 1 },
            quota: response.quota || null,
        };
    },

    /**
     * Gợi ý nội dung liên quan (UC11 Explore Related Content)
     */
    async getRelated(idOrSlug, limit = 4) {
        const response = await api.get(`/literature/${idOrSlug}/related?limit=${limit}`);
        return response.data || [];
    },

    /**
     * Yêu cầu AI giải thích chi tiết câu ca dao, tục ngữ (UC10 Request AI Explanation)
     */
    async explainWork({ workId, slug }) {
        const response = await api.post('/ai/explain', { workId, slug });
        return response.data;
    },

    /**
     * Lấy toàn bộ dữ liệu Đồ thị Tri thức Dân gian (Nodes, Links, Summary, Categories)
     */
    async getKnowledgeGraph() {
        const response = await api.get('/literature/knowledge-graph');
        return response.data;
    },

    /**
     * Tìm đường đi văn hóa ngắn nhất giữa 2 thực thể tri thức (BFS Shortest Path)
     */
    async getKnowledgeGraphShortestPath(source, target) {
        const response = await api.get(`/literature/knowledge-graph/shortest-path?source=${encodeURIComponent(source)}&target=${encodeURIComponent(target)}`);
        return response.data;
    },
};

export default literatureService;
