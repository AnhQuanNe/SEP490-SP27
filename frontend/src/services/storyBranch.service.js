import api from './api';

const storyBranchService = {
    /**
     * Lấy danh sách các câu chuyện rẽ nhánh có sẵn
     */
    getStories: async () => {
        const response = await api.get('/story-branch/stories');
        return response.data || [];
    },

    /**
     * Lấy chi tiết một câu chuyện
     */
    getStoryDetail: async (slug) => {
        const response = await api.get(`/story-branch/stories/${slug}`);
        return response.data;
    },

    /**
     * Tiến bước tới hồi tiếp theo
     */
    nextChapter: async (payload) => {
        const response = await api.post('/story-branch/next', payload);
        return response.data;
    },
};

export default storyBranchService;
