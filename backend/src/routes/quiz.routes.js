const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quiz.controller');
const { optionalAuth, protect } = require('../middlewares/auth.middlewares');

// Lấy danh sách câu hỏi đố vui (Guest hoặc Registered User, hỗ trợ personalized & daily)
router.get('/questions', optionalAuth, quizController.getQuestions);

// Nộp bài thi trắc nghiệm (Tự động lưu tiến độ & huy hiệu nếu là Registered User)
router.post('/submit', optionalAuth, quizController.submit);

// Lấy tiến độ học tập, thống kê chủ đề & huy hiệu thành tích (Yêu cầu đăng nhập)
router.get('/progress', protect, quizController.getProgress);

// Yêu cầu AI giải thích sâu ý nghĩa, bài học và bối cảnh văn hóa của câu hỏi
router.post('/ai-explain', optionalAuth, quizController.explainQuestionWithAi);

module.exports = router;
