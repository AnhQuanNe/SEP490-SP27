const storyBranchService = require('../services/storyBranch.service');

/**
 * Lấy danh sách các câu chuyện rẽ nhánh có sẵn
 */
const getStories = async (req, res) => {
    try {
        const stories = storyBranchService.getStoriesList();
        res.status(200).json({
            success: true,
            data: stories,
        });
    } catch (error) {
        console.error('[StoryBranch Controller] Lỗi lấy danh sách truyện:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Không thể tải danh sách truyện rẽ nhánh',
        });
    }
};

/**
 * Lấy chi tiết một câu chuyện và chương khởi đầu
 */
const getStoryDetail = async (req, res) => {
    try {
        const { slug } = req.params;
        const story = storyBranchService.getStoryBySlug(slug);

        if (!story) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy câu chuyện cổ tích yêu cầu',
            });
        }

        res.status(200).json({
            success: true,
            data: story,
        });
    } catch (error) {
        console.error('[StoryBranch Controller] Lỗi lấy chi tiết truyện:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi khi tải chi tiết câu chuyện',
        });
    }
};

/**
 * Tiến bước: Người chơi đưa ra quyết định, AI sinh tiếp hồi tiếp theo
 */
const nextChapter = async (req, res) => {
    try {
        const { storySlug, step, chosenText, previousHistory, currentStats } = req.body;

        if (!storySlug || !chosenText) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp mã truyện (storySlug) và lựa chọn hành động (chosenText)',
            });
        }

        const result = await storyBranchService.generateNextChapter({
            storySlug,
            step: Number(step) || 1,
            chosenText,
            previousHistory: previousHistory || [],
            currentStats: currentStats || { tam: 50, tri: 50, dung: 50, longDan: 50 },
        });

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('[StoryBranch Controller] Lỗi tiến bước câu chuyện:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi khi sinh tiếp diễn biến câu chuyện',
        });
    }
};

module.exports = {
    getStories,
    getStoryDetail,
    nextChapter,
};
