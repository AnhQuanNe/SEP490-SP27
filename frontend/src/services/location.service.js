import api from './api';

export const locationService = {
    /**
     * Lấy danh sách địa phương công khai kèm số lượng tác phẩm
     * @param {Object} params - { category, region }
     */
    async getLocations({ category = 'all', region = '' } = {}) {
        const params = new URLSearchParams();
        if (category && category !== 'all') params.append('category', category);
        if (region && region !== 'all') params.append('region', region);

        const response = await api.get(`/locations?${params.toString()}`);
        return response.data || [];
    },

    /**
     * Lấy chi tiết thông tin một địa phương
     * @param {string} idOrSlug - ID hoặc slug của địa phương
     */
    async getLocationDetail(idOrSlug) {
        const response = await api.get(`/locations/${idOrSlug}`);
        return response.data;
    },

    /**
     * Lấy danh sách tác phẩm thuộc về một địa phương
     * @param {string} idOrSlug - ID hoặc slug của địa phương
     * @param {Object} params - { category, page, limit }
     */
    async getLocationWorks(idOrSlug, { category = 'all', page = 1, limit = 10 } = {}) {
        const params = new URLSearchParams();
        if (category && category !== 'all') params.append('category', category);
        if (page) params.append('page', page);
        if (limit) params.append('limit', limit);

        const response = await api.get(`/locations/${idOrSlug}/works?${params.toString()}`);
        return response.data;
    },

    /**
     * Lấy dữ liệu tổng hợp cho bản đồ (markers + preview tác phẩm)
     * @param {Object} params - { category, region }
     */
    async getMapWorks({ category = 'all', region = '' } = {}) {
        const params = new URLSearchParams();
        if (category && category !== 'all') params.append('category', category);
        if (region && region !== 'all') params.append('region', region);

        const response = await api.get(`/map/works?${params.toString()}`);
        return response.data;
    },
};

export default locationService;
