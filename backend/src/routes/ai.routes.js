const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');

// Trả lời câu hỏi thông minh kèm trích dẫn nguồn học thuật (UC10)
router.post('/ask', aiController.ask);

// Yêu cầu AI giải thích chi tiết câu ca dao, tục ngữ (UC10)
router.post('/explain', aiController.explain);

// Lấy danh sách câu hỏi gợi ý khám phá nhanh
router.get('/suggestions', aiController.getSuggestions);

// Tính năng mới: Gia sư văn hóa AI (AI Cultural Tutor)
router.get('/tutor/topics', aiController.getTutorTopics);
router.post('/tutor', aiController.tutorChat);

module.exports = router;
