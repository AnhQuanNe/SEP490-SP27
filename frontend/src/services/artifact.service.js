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
    },

    // AI Real 100%: Sinh 3 câu hỏi trắc nghiệm tương tác bằng AI
    generateQuizWithAI: async (artifact, options = {}) => {
        try {
            const res = await api.post('/artifacts/ai-generate-quiz', {
                artifact,
                slug: artifact?.slug,
                isRefresh: options.isRefresh || false,
                timestamp: options.timestamp || Date.now()
            });
            return res.data?.data || res.data;
        } catch (error) {
            console.error('Lỗi gọi API sinh câu đố AI:', error);
            throw error;
        }
    },

    // AI Real 100%: Kính Lúp Di Sản AI mổ xẻ chuyên sâu điểm chạm khảo cứu
    inspectHotspotWithAI: async (artifact, hotspot, angleTitle = '') => {
        try {
            const res = await api.post('/artifacts/ai-inspect-hotspot', {
                artifact,
                hotspot,
                angleTitle,
                slug: artifact?.slug
            });
            return res.data?.data || res.data;
        } catch (error) {
            console.error('Lỗi gọi API AI Kính Lúp điểm chạm:', error);
            throw error;
        }
    }
};

export default artifactService;
