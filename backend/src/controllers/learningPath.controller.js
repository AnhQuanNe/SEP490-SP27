const learningPathService = require('../services/learningPath.service');

/**
 * Controller quản lý Lộ trình học văn hóa cá nhân hóa (Personalized Cultural Learning Path)
 */
class LearningPathController {
    /**
     * Lấy danh sách các chủ đề học tập khả dụng từ MongoDB
     * GET /api/learning-paths/topics
     */
    async getTopics(req, res) {
        try {
            const topics = await learningPathService.getAvailableTopics();
            res.status(200).json({
                success: true,
                data: topics,
            });
        } catch (error) {
            console.error('[LearningPathController] Lỗi lấy danh sách chủ đề:', error.message);
            res.status(500).json({
                success: false,
                message: error.message || 'Không thể tải danh sách chủ đề',
            });
        }
    }

    /**
     * Tạo lộ trình học cá nhân hóa mới
     * POST /api/learning-paths
     */
    async createPath(req, res) {
        try {
            const userId = req.user._id;
            const { topic, goal, totalDays, dailyMinutes } = req.body;

            if (!topic) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng chọn chủ đề học tập',
                });
            }

            const path = await learningPathService.createLearningPath({
                userId,
                topic,
                goal,
                totalDays,
                dailyMinutes,
            });

            res.status(201).json({
                success: true,
                message: 'Tạo lộ trình học cá nhân hóa thành công',
                data: path,
            });
        } catch (error) {
            console.error('[LearningPathController] Lỗi tạo lộ trình:', error.message);
            res.status(400).json({
                success: false,
                message: error.message || 'Lỗi khi tạo lộ trình học tập',
            });
        }
    }

    /**
     * Lấy danh sách tất cả lộ trình của người dùng hiện tại
     * GET /api/learning-paths
     */
    async getUserPaths(req, res) {
        try {
            const userId = req.user._id;
            const paths = await learningPathService.getUserPaths(userId);

            res.status(200).json({
                success: true,
                data: paths,
            });
        } catch (error) {
            console.error('[LearningPathController] Lỗi lấy danh sách lộ trình:', error.message);
            res.status(500).json({
                success: false,
                message: error.message || 'Không thể tải danh sách lộ trình',
            });
        }
    }

    /**
     * Lấy lộ trình đang học gần nhất của người dùng
     * GET /api/learning-paths/active
     */
    async getActivePath(req, res) {
        try {
            const userId = req.user._id;
            const activePath = await learningPathService.getActivePath(userId);

            res.status(200).json({
                success: true,
                data: activePath,
            });
        } catch (error) {
            console.error('[LearningPathController] Lỗi lấy lộ trình đang học:', error.message);
            res.status(500).json({
                success: false,
                message: error.message || 'Không thể lấy thông tin lộ trình đang học',
            });
        }
    }

    /**
     * Lấy chi tiết một lộ trình và các bài học của người dùng
     * GET /api/learning-paths/:id
     */
    async getPathById(req, res) {
        try {
            const userId = req.user._id;
            const pathId = req.params.id;

            const path = await learningPathService.getPathById({ pathId, userId });

            res.status(200).json({
                success: true,
                data: path,
            });
        } catch (error) {
            console.error('[LearningPathController] Lỗi lấy chi tiết lộ trình:', error.message);
            const isNotFound = error.message.includes('Không tìm thấy') || error.message.includes('không hợp lệ');
            res.status(isNotFound ? 404 : 500).json({
                success: false,
                message: error.message || 'Không thể tải chi tiết lộ trình',
            });
        }
    }

    /**
     * Đánh dấu hoàn thành một ngày học
     * POST /api/learning-paths/:id/days/:day/complete
     */
    async completeDay(req, res) {
        try {
            const userId = req.user._id;
            const pathId = req.params.id;
            const dayNumber = req.params.day;
            const { userNotes } = req.body;

            const updatedPath = await learningPathService.completeDayLesson({
                pathId,
                userId,
                dayNumber,
                userNotes,
            });

            res.status(200).json({
                success: true,
                message: `Đã hoàn thành bài học Ngày ${dayNumber}`,
                data: updatedPath,
            });
        } catch (error) {
            console.error('[LearningPathController] Lỗi hoàn thành ngày học:', error.message);
            res.status(400).json({
                success: false,
                message: error.message || 'Không thể cập nhật trạng thái bài học',
            });
        }
    }

    /**
     * Nộp bài kiểm tra trắc nghiệm của một ngày học
     * POST /api/learning-paths/:id/days/:day/quiz
     */
    async submitDayQuiz(req, res) {
        try {
            const userId = req.user._id;
            const pathId = req.params.id;
            const dayNumber = req.params.day;
            const { answers } = req.body;

            if (!answers || !Array.isArray(answers)) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng cung cấp danh sách câu trả lời trắc nghiệm',
                });
            }

            const result = await learningPathService.submitDayQuiz({
                pathId,
                userId,
                dayNumber,
                answers,
            });

            res.status(200).json({
                success: true,
                message: `Đã chấm điểm bài tập Ngày ${dayNumber}: ${result.score}/100`,
                data: result,
            });
        } catch (error) {
            console.error('[LearningPathController] Lỗi nộp bài kiểm tra ngày:', error.message);
            res.status(400).json({
                success: false,
                message: error.message || 'Không thể chấm điểm bài tập ngày',
            });
        }
    }

    /**
     * Xóa lộ trình học
     * DELETE /api/learning-paths/:id
     */
    async deletePath(req, res) {
        try {
            const userId = req.user._id;
            const pathId = req.params.id;

            const result = await learningPathService.deletePath({ pathId, userId });

            res.status(200).json({
                success: true,
                message: result.message,
            });
        } catch (error) {
            console.error('[LearningPathController] Lỗi xóa lộ trình:', error.message);
            res.status(400).json({
                success: false,
                message: error.message || 'Không thể xóa lộ trình',
            });
        }
    }
}

module.exports = new LearningPathController();
