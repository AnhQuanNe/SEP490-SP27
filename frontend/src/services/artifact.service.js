import api from './api';

export const artifactService = {
    // Lấy danh sách tất cả bảo vật từ MongoDB
    getAllArtifacts: async () => {
        try {
            const res = await api.get('/artifacts');
            return res.data?.data || res.data || [];
        } catch (error) {
            console.error('Lỗi tải danh sách bảo vật từ API:', error);
            throw error;
        }
    },

    // Lấy chi tiết bảo vật theo slug
    getArtifactBySlug: async (slug) => {
        try {
            const res = await api.get(`/artifacts/${slug}`);
            return res.data?.data || res.data;
        } catch (error) {
            console.error(`Lỗi tải bảo vật ${slug}:`, error);
            throw error;
        }
    }
};

export default artifactService;
