const express = require('express');
const router = express.Router();
const learningPathController = require('../controllers/learningPath.controller');
const { protect, optionalAuth } = require('../middlewares/auth.middlewares');

// 1. Lấy danh sách các chủ đề khả dụng (dựa trên số lượng tác phẩm thật trong MongoDB)
router.get('/topics', optionalAuth, learningPathController.getTopics);

// 2. Tạo lộ trình học cá nhân hóa mới (FR-1 & FR-2)
router.post('/', protect, learningPathController.createPath);

// 3. Lấy danh sách tất cả lộ trình của người dùng hiện tại (FR-5)
router.get('/', protect, learningPathController.getUserPaths);

// 4. Lấy lộ trình đang học gần nhất để tiếp tục học ngay (FR-4)
router.get('/active', protect, learningPathController.getActivePath);

// 5. Lấy chi tiết một lộ trình và các bài học hằng ngày (FR-4)
router.get('/:id', protect, learningPathController.getPathById);

// 6. Đánh dấu hoàn thành một ngày học (FR-4 & FR-5)
router.post('/:id/days/:day/complete', protect, learningPathController.completeDay);

// 7. Nộp bài luyện tập trắc nghiệm theo ngày, tính điểm và cập nhật đề xuất cá nhân hóa (FR-6 & FR-7)
router.post('/:id/days/:day/quiz', protect, learningPathController.submitDayQuiz);

// 8. Xóa lộ trình
router.delete('/:id', protect, learningPathController.deletePath);

module.exports = router;
