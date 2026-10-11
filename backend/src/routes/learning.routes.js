const express = require('express');
const router = express.Router();
const {
    getSkillTree,
    getLessonById,
    completeLesson,
    getUserStats,
} = require('../controllers/learning.controller');
const { protect, optionalAuth } = require('../middlewares/auth.middlewares');

// Lấy toàn bộ cây kỹ năng (Khách xem được cơ bản, Học viên thấy tiến độ thật)
router.get('/skill-tree', optionalAuth, getSkillTree);

// Lấy chi tiết một bài học
router.get('/lessons/:id', optionalAuth, getLessonById);

// Ghi nhận hoàn thành bài tập Gương ảo AI (Yêu cầu đăng nhập)
router.post('/lessons/:id/complete', protect, completeLesson);

// Thống kê năng lực cá nhân (Yêu cầu đăng nhập)
router.get('/stats', protect, getUserStats);

module.exports = router;
